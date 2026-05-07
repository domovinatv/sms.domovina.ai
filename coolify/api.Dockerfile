FROM golang:1.25-alpine AS builder

ARG GIT_COMMIT=unknown
ENV GIT_COMMIT=$GIT_COMMIT

RUN apk add --no-cache git ca-certificates

WORKDIR /http-sms

COPY httpsms/api/go.mod httpsms/api/go.sum ./
RUN go mod download

COPY httpsms/api/ ./

RUN go install github.com/swaggo/swag/cmd/swag@latest \
 && swag init --requiredByDefault --parseDependency --parseInternal

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags "-X main.Version=$GIT_COMMIT" -o /bin/http-sms .

FROM alpine:latest

RUN apk add --no-cache curl ca-certificates tzdata \
 && addgroup -S http-sms && adduser -S http-sms -G http-sms

USER http-sms
WORKDIR /home/http-sms

COPY --from=builder /usr/local/go/lib/time/zoneinfo.zip /zoneinfo.zip
COPY --from=builder /bin/http-sms ./
COPY --from=builder /http-sms/root.crt ./

ENV ZONEINFO=/zoneinfo.zip

EXPOSE 8000

ENTRYPOINT ["./http-sms", "--dotenv=false"]

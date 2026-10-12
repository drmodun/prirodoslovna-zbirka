# Piper text-to-speech behind a small HTTP server.
#   POST / {"text": "..."}  ->  audio/wav
FROM python:3.12-slim
ARG PIPER_VOICE=sr_RS-serbski_institut-medium
ENV PIPER_VOICE=$PIPER_VOICE
WORKDIR /voices
ARG PIPER_VERSION=1.8.0
RUN pip install --no-cache-dir "piper-tts[http]==$PIPER_VERSION" \
  && python -m piper.download_voices "$PIPER_VOICE"
RUN useradd --system piper
USER piper
EXPOSE 5000
CMD ["sh", "-c", "exec python -m piper.http_server --model \"$PIPER_VOICE\" --data-dir /voices --host 0.0.0.0 --port 5000"]

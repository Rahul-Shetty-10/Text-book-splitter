FROM node:20-bookworm-slim

WORKDIR /app

# Install Python and provide a `python` binary because the Next.js API routes
# spawn `python` directly when invoking the PDF processor.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip python3-venv python-is-python3 \
    && rm -rf /var/lib/apt/lists/*

ENV VIRTUAL_ENV=/opt/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY package*.json ./
COPY python_service/requirements.txt ./python_service/requirements.txt

RUN npm ci
RUN python3 -m venv "$VIRTUAL_ENV" \
    && pip install --no-cache-dir -r python_service/requirements.txt

COPY . .

RUN mkdir -p uploads outputs
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]

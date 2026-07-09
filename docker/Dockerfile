FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

ARG PUBLIC_AUTH_BASE_URL=https://auth.mercantec.tech
ARG PUBLIC_AUTH_CLIENT_ID=demo
ARG PUBLIC_AUTH_ISSUER=https://auth.mercantec.tech
ARG PUBLIC_AUTH_AUDIENCE=mercantec-apps
ARG PUBLIC_SITE_URL=https://mercantec.tech
ARG PUBLIC_STUDENTS_API_URL=https://api-students.mercantec.tech
ENV PUBLIC_AUTH_BASE_URL=$PUBLIC_AUTH_BASE_URL
ENV PUBLIC_AUTH_CLIENT_ID=$PUBLIC_AUTH_CLIENT_ID
ENV PUBLIC_AUTH_ISSUER=$PUBLIC_AUTH_ISSUER
ENV PUBLIC_AUTH_AUDIENCE=$PUBLIC_AUTH_AUDIENCE
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL
ENV PUBLIC_STUDENTS_API_URL=$PUBLIC_STUDENTS_API_URL

RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html

RUN chmod +x /entrypoint.sh

ENV PUBLIC_SITE_URL=https://mercantec.tech

EXPOSE 4040

CMD ["/entrypoint.sh"]

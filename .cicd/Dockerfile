FROM nginx:1.19.10
LABEL maintainer="mashaojie@pinefield-inc.com"
ADD ./dist/ /usr/share/nginx/html
ADD ./.cicd/nginx.conf /etc/nginx
EXPOSE 80

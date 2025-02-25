# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia el package.json y package-lock.json al contenedor
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de la aplicación al contenedor
COPY . .

# Exponer el puerto en el que corre el servidor
EXPOSE 5001

# Comando para correr el servidor
CMD [ "node", "proxy-server.js" ]

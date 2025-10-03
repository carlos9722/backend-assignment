# Imagen base de Node.js
FROM node:18

# Crear y cambiar al directorio de trabajo
WORKDIR /app

# Copiar los archivos de definición de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente al contenedor
COPY . .

# Exponer el puerto (el mismo del .env)
EXPOSE 3001

# Comando que inicia el servicio
CMD ["npm", "run", "dev"]

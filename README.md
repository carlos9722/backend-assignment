
# 📦 Backend B2B Pedidos – Prueba Técnica

Sistema backend mínimo para gestión de clientes, productos y órdenes; con base de datos relacional y orquestación vía Lambda.

---

## 🧰 Stack Tecnológico

- Node.js + Express
- MySQL 8
- Docker + Docker Compose
- Serverless Framework (offline)
- JWT Auth
- Axios + Zod
- OpenAPI 3.0

---

## 📁 Estructura del repositorio

├── customers-api/  
├── orders-api/  
├── lambda-orchestrator/  
├── db/  
│ ├── schema.sql  
│ └── seed.sql  
├── docker-compose.yml  
├── README.md


---

## 🔧 Configuración

### 1  Clonar el repositorio

Para comenzar, clona el repositorio en tu máquina local con el siguiente comando:

    git clone (https://github.com/carlos9722/backend-assignment.git
    cd backend-assignment

Este comando descargará el código fuente del repositorio y te llevará a la carpeta del proyecto.

### 2. Variables de entorno

Copiar y personalizar los archivos `.env` en cada servicio (`customers-api`, `orders-api`, `lambda-orchestrator`) hay un archivo `.env.example`.`:

`cp customers-api/.env.example customers-api/.env
cp orders-api/.env.example orders-api/.env
cp lambda-orchestrator/.env.example lambda-orchestrator/.env`

### 3. Levantar con Docker Compose

`docker-compose up --build -d`

-   Customers API: [http://localhost:3001](http://localhost:3001)
    
-   Orders API: [http://localhost:3002](http://localhost:3002)
    
-   PhpMyAdmin: [http://localhost:8080](http://localhost:8080) (usuario: `root`, contraseña: `root`)

###  4🧪 Verificar APIs

-   `GET http://localhost:3001/health` → Customers API OK
    
-   `GET http://localhost:3002/health` → Orders API OK

###  5 Autenticación

-   JWT: generado con `JWT_SECRET` desde `.env`
    
-   Para endpoints internos (`/internal`), se usa `SERVICE_TOKEN` como bearer token

###  6 🔐 Generar JWT válido para pruebas

https://www.jwt.io/

JWT Encoder

#### Payload: Data
{
"user_id":1
}

#### Sign JWT: Secret
my_secret_key

###  7  🧪 Probar endpoints con cURL

#### 1. Crear cliente

curl -X POST http://localhost:3001/customers \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "ACME", "email": "acme@company.com", "phone": "123456789"}'

#### 2. Crear cliente
curl -X POST http://localhost:3002/products \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"sku": "LAP123", "name": "Laptop", "price_cents": 99900, "stock": 10}'


#### 3. Crear y confirmar orden via Lambda
curl -X POST http://localhost:4000/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{ "product_id": 1, "qty": 2 }],
    "idempotency_key": "order-001",
    "correlation_id": "req-001"
  }'


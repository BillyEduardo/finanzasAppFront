# Docker — Finanzas App

Tres contenedores en la misma red:

- `frontend`: Angular servido por Nginx en http://localhost:8080
- `backend`: API .NET en http://localhost:5165 (Swagger en `/swagger`)
- `postgres`: base de datos. En tu máquina el puerto es **5433**

## Arrancar

Desde esta carpeta:

```bash
docker compose up --build
```

Para parar: `Ctrl+C` y luego `docker compose down`.

`docker compose down -v` borra también los datos de Postgres.

## Cómo se hablan

El navegador solo ve el frontend (`localhost:8080`). Las llamadas a `/api` las recibe Nginx y las reenvía al contenedor `backend` por la red interna de Docker. El API no usa `localhost` para la base: usa el nombre del servicio `postgres`.

`ng serve` no cambia: sigue yendo a `https://localhost:7165`.

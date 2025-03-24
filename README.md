
# 🎀 Gestor de Inventario Violetta 

![Banner del Proyecto](https://raw.githubusercontent.com/IanSierra/gestor-inventario-violetta/main/assets/banner.png)  
*Sistema profesional para gestión de vestidos - Rentas, ventas y análisis en tiempo real*

[![Live Demo](https://img.shields.io/badge/Demo-En_Vivo-FF69B4?style=for-the-badge&logo=vercel)](https://violetta-demo.vercel.app)
[![Tests](https://img.shields.io/github/actions/workflow/status/IanSierra/gestor-inventario-violetta/main.yml?label=Tests&logo=github&style=for-the-badge)](https://github.com/IanSierra/gestor-inventario-violetta/actions)
[![Coverage](https://img.shields.io/badge/Cobertura-95%25-brightgreen?style=for-the-badge)](https://ian-sierra.com/violetta-coverage)

<div align="center">
  <img src="https://raw.githubusercontent.com/IanSierra/gestor-inventario-violetta/main/assets/demo.gif" width="800" alt="Demo interactiva">
</div>

## 🌟 Features Destacadas

| **Gestión Avanzada**         | **Tecnologías Clave**          | **Seguridad**               |
|------------------------------|---------------------------------|-----------------------------|
| ✅ CRUD de productos         | 🚀 Full TypeScript             | 🔐 Autenticación JWT        |
| 📊 Dashboard interactivo     | 🎨 UI con Tailwind + Radix     | 🔒 Roles de usuario         |
| 📦 Inventario inteligente    | 🐘 PostgreSQL + Drizzle ORM    | 🛡️ Validación Zod          |
| 💸 Transacciones complejas   | ⚡ React Query State Management| 📜 Auditoría de cambios     |
| 🔍 Búsqueda predictiva       | 📱 Diseño Responsivo           | 🔄 Refresh Token            |

## 🛠️ Tech Stack Legendario

<div align="center">
  <img src="https://skillicons.dev/icons?i=ts,react,tailwind,nodejs,postgres,docker,figma,git&perline=8" alt="Tech Stack">
</div>

## 🧩 Arquitectura del Sistema

```mermaid
graph TD
    A[Cliente] -->|HTTPS| B[API]
    B --> C[Base de Datos]
    B --> D[Servicios]
    D --> E[Autenticación]
    D --> F[Transacciones]
    D --> G[Reportes]
    subgraph Frontend
    A --> H[Componentes React]
    H --> I[Tailwind CSS]
    H --> J[React Query]
    end
    subgraph Backend
    B --> K[Express.js]
    K --> L[Drizzle ORM]
    K --> M[Zod]
    end
```

## 🚀 Primeros Pasos

### Requisitos Previos
- Node.js 18+
- PostgreSQL 15+
- Docker (opcional)

### Instalación Relámpago ⚡
```bash
git clone https://github.com/IanSierra/gestor-inventario-violetta.git
cd gestor-inventario-violetta
npm run setup # ¡Instala todo automáticamente!
```

### Variables de Entorno
Crea un archivo `.env` con:
```env
# Server
DATABASE_URL="postgres://user:pass@localhost:5432/violetta_db"
JWT_SECRET="tu_super_secreto"
```

### Iniciar el Sistema
```bash
npm run dev # Inicia backend y frontend simultáneamente!
```

## 📊 Métricas del Proyecto

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api/pin/?username=IanSierra&repo=gestor-inventario-violetta&theme=radical" alt="Repo Stats">
  <img src="https://github-readme-tech-stack.vercel.app/api/cards?title=Tecnologías&lineCount=2&line1=typescript,typescript,react,react;node.js,node.js,postgresql,postgresql&line2=tailwind,tailwind,drizzle,drizzle;zod,zod,react-query,react-query&theme=radical" alt="Tech Stack Card">
</div>

## 🎨 Capturas de Pantalla

| **Dashboard** | **Gestión de Inventario** |
|---------------|---------------------------|
| <img src="https://raw.githubusercontent.com/IanSierra/gestor-inventario-violetta/main/assets/screenshots/dashboard.png" width="400"> | <img src="https://raw.githubusercontent.com/IanSierra/gestor-inventario-violetta/main/assets/screenshots/inventory.png" width="400"> |

| **Transacciones** | **Clientes** |
|-------------------|--------------|
| <img src="https://raw.githubusercontent.com/IanSierra/gestor-inventario-violetta/main/assets/screenshots/transactions.png" width="400"> | <img src="https://raw.githubusercontent.com/IanSierra/gestor-inventario-violetta/main/assets/screenshots/clients.png" width="400"> |

## 🧪 Suite de Tests
```bash
npm test # Ejecuta todos los tests
npm run test:cov # Con cobertura
npm run test:e2e # Pruebas end-to-end
```

## 🤝 Guía de Contribución
1. 🍴 Haz Fork del repositorio
2. 🌿 Crea una feature branch: `git checkout -b feat/nueva-magia`
3. 💾 Haz commit de tus cambios: `git commit -m "feat: ✨ nueva funcionalidad mágica"`
4. 🚀 Push a la rama: `git push origin feat/nueva-magia`
5. 🔀 Abre un Pull Request

## 📚 Documentación Adicional
- [API Reference](https://github.com/IanSierra/gestor-inventario-violetta/wiki/API-Reference)
- [Arquitectura Detallada](https://github.com/IanSierra/gestor-inventario-violetta/wiki/System-Architecture)
- [Guía de Estilo](https://github.com/IanSierra/gestor-inventario-violetta/wiki/Style-Guide)

## 📜 Licencia
Este proyecto está bajo la licencia [MIT](LICENSE) - *Haz magia con él!* ✨

---

<div align="center">
  Hecho con ❤️ por [Ian Sierra](https://github.com/IanSierra) | 🦄 ¡Sé parte de la magia!
</div>
```

### 🎁 Para hacerlo aún más épico:
1. **Agrega assets visuales**:
   - Crea un banner.png (1280x640px)
   - Capturas de pantalla HD en /assets/screenshots
   - GIF animado de la demo

2. **Configura GitHub Actions** para CI/CD:
   ```yaml
   name: CI/CD Pipeline
   on: [push, pull_request]
   
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v3
           with:
             node-version: 18
         - run: npm ci
         - run: npm run build
         - run: npm test
   ```

3. **Agrega documentación interactiva**:
   - Usa [Swagger](https://swagger.io/) para la API
   - Crea un storybook para componentes UI

4. **Configura Code Climate** para métricas de calidad:
   ```yaml
   # .codeclimate.yml
   version: "2"
   checks:
     method-lines:
       enabled: true
       config:
         threshold: 15
   ```

5. **Añade un CHANGELOG.md** con:
   ```markdown
   # Changelog

   ## [1.0.0] - 2024-03-01
   ### Added
   - Sistema base de gestión de inventario
   - Autenticación JWT
   - Dashboard interactivo
   ```

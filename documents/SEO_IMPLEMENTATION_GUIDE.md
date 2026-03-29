# Guía Completa de Implementación SEO

## softwaresolutions.com.mx

**Versión:** 1.0  
**Fecha:** 18 de Marzo, 2026  
**Stack:** React SPA (Vite), Vercel Deployment  
**Estado:** Implementación en progreso

---

## Tabla de Contenidos

1. [Sección General - Plan Maestro SEO](#sección-1-general---plan-maestro-seo)
2. [Sección de Desarrollo - Tareas Técnicas](#sección-2-desarrollo---tareas-técnicas)
3. [Sección de Cuentas y Configuración Externa](#sección-3-cuentas-y-configuración-externa)

---

# SECCIÓN 1: GENERAL - PLAN MAESTRO SEO

## 1.1 Auditoría Inicial

### Objetivo

Establecer la línea base del estado actual del sitio antes de implementar cambios.

### Qué auditar

#### 1.1.1 Estado de Indexación

- [ ] Ejecutar `site:softwaresolutions.com.mx` en Google
- [ ] Verificar cuántas páginas están indexadas
- [ ] Identificar páginas que deberían estar indexadas pero no lo están
- [ ] Identificar páginas indexadas que no deberían estarlo

#### 1.1.2 Análisis de Competencia

- [ ] Identificar competidores directos en México
- [ ] Analizar sus keywords principales
- [ ] Revisar su estructura de contenido
- [ ] Evaluar su velocidad de carga
- [ ] Revisar sus backlinks (con Ahrefs/SEMrush free)

#### 1.1.3 Keywords Actuales

- [ ] Documentar keywords objetivo actuales
- [ ] Identificar keywords long-tail oportunas
- [ ] Clasificar keywords por dificultad y volumen
- [ ] Priorizar keywords locales (México, Chihuahua)

#### 1.1.4 Problemas Técnicos

- [ ] Verificar tiempos de carga (PageSpeed Insights)
- [ ] Identificar enlaces rotos
- [ ] Revisar estructura de URLs
- [ ] Verificar responsive design
- [ ] Comprobar certificado SSL

### Validación

- Documento con hallazgos principales
- Lista priorizada de problemas a resolver
- Benchmark de métricas antes de cambios

### Responsable

- SEO Manager / Product Owner

---

## 1.2 SEO Técnico

### Objetivo

Asegurar que Google y otros buscadores puedan rastrear, indexar y entender correctamente el sitio.

### 1.2.1 Renderizado para Bots

**Problema:** React SPA entrega HTML vacío a crawlers.

**Solución Implementada:**

- ✅ React Helmet Async para meta tags dinámicos
- ⚠️ React-snap deshabilitado (problemas en Vercel)
- 🔄 Alternativa: Vercel automaticamente prerenderiza o usar servicio externo

**Por qué:**

- Google puede ejecutar JavaScript pero es lento
- Otros bots (redes sociales) no ejecutan JS
- Prerendering garantiza contenido visible inmediatamente

**Validación:**

```bash
curl -s https://softwaresolutions.com.mx/ | grep '<h1'
# Debe retornar: <h1>Desarrollo de Software a la Medida en México</h1>
```

### 1.2.2 Configuración de robots.txt

**Ubicación:** `public/robots.txt`

**Debe incluir:**

```
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/

Sitemap: https://softwaresolutions.com.mx/sitemap.xml
```

**Por qué:**

- Guía a los bots sobre qué rastrear
- Previene indexación de páginas privadas
- Declara ubicación del sitemap

**Validación:**

```bash
curl https://softwaresolutions.com.mx/robots.txt
```

### 1.2.3 Sitemap XML

**Ubicación:** `public/sitemap.xml`

**Debe listar:**

- Todas las páginas públicas
- Fecha de última modificación
- Frecuencia de cambio
- Prioridad relativa

**Por qué:**

- Ayuda a Google a descubrir todas tus páginas
- Proporciona metadata útil para rastreo
- Permite rastreo más eficiente

**Validación:**

```bash
curl https://softwaresolutions.com.mx/sitemap.xml
# Verificar que lista todas las URLs correctas
```

### 1.2.4 URLs Canónicas

**Implementación:**
Cada página debe tener un canonical tag:

```html
<link rel="canonical" href="https://softwaresolutions.com.mx/services" />
```

**Por qué:**

- Previene contenido duplicado
- Consolida señales de ranking en una URL
- Especialmente importante para parámetros de URL

**Validación:**

- Verificar en código fuente de cada página
- No debe haber URLs con y sin www indexadas

### 1.2.5 Estructura de URLs

**Buenas prácticas:**

- ✅ `/services` - limpia, descriptiva
- ✅ `/about` - corta, clara
- ❌ `/page?id=123` - no descriptiva
- ❌ `/#/services` - hash routing (no indexable)

**Estado actual:** ✅ BrowserRouter implementado

### 1.2.6 Idioma y Localización

**Implementación:**

```html
<html lang="es-MX"></html>
```

**Por qué:**

- Ayuda a Google a entender el idioma del contenido
- Mejora accesibilidad
- Es factor para resultados de búsqueda local

**Validación:**

- Verificar en `<html>` tag de todas las páginas

### 1.2.7 Certificado SSL/HTTPS

**Estado:** ✅ Implementado (Vercel)

**Por qué:**

- Requisito para ranking en Google
- Confianza del usuario
- Necesario para PWA

---

## 1.3 SEO On-Page

### Objetivo

Optimizar el contenido y estructura HTML de cada página para keywords objetivo.

### 1.3.1 Estructura de Headings (H1-H6)

**Reglas obligatorias:**

- Exactamente UN `<h1>` por página
- El `<h1>` debe contener la keyword principal
- Jerarquía lógica: h1 → h2 → h3 (no saltar niveles)
- Los headings no son para estilo, son para estructura semántica

**Implementación por página:**

**Home (`/`):**

```
<h1>Desarrollo de Software a la Medida en México</h1>
  <h2>Nuestros Servicios</h2>
    <h3>Desarrollo de Aplicaciones Web</h3>
    <h3>Sistemas Empresariales a la Medida</h3>
  <h2>Por Qué Elegirnos</h2>
  <h2>Clientes y Casos de Éxito</h2>
```

**Services (`/services`):**

```
<h1>Servicios de Desarrollo de Software</h1>
  <h2>Desarrollo de Software a la Medida</h2>
  <h2>Aplicaciones Web y Móviles</h2>
  <h2>Sistemas de Gestión Empresarial (ERP)</h2>
```

**Por qué:**

- Google usa headings para entender estructura del contenido
- Mejora accesibilidad para screen readers
- Ayuda a featured snippets

**Validación:**

```bash
curl -s https://softwaresolutions.com.mx/ | grep -E '<h[1-6]'
# Verificar estructura correcta
```

### 1.3.2 Title Tags

**Formato:**

```
[Keyword Principal] | Nombre de Empresa
```

**Ejemplos:**

- Home: "Desarrollo de Software a la Medida en México | Software Solutions"
- Services: "Servicios de Desarrollo de Software | Software Solutions"

**Reglas:**

- Max 60 caracteres (incluyendo separador y marca)
- Único para cada página
- Contiene keyword principal
- Atractivo para el usuario

**Validación:**

- Verificar en código fuente
- Buscar en Google y ver cómo se muestra

### 1.3.3 Meta Descriptions

**Formato:**
150-160 caracteres, llamado a la acción claro, incluye keyword.

**Ejemplos:**

- Home: "Software Solutions: desarrollamos aplicaciones web, sistemas empresariales y software personalizado para empresas en México. Cotización sin costo."

**Por qué:**

- No es factor directo de ranking
- Influye en CTR (click-through rate)
- Mejora la experiencia en resultados de búsqueda

**Validación:**

- Longitud correcta
- Relevante al contenido
- Sin caracteres especiales que se rompen

### 1.3.4 Imágenes y Alt Text

**Reglas:**

- TODA imagen debe tener `alt` descriptivo
- TODA imagen debe declarar `width` y `height`
- Usar `loading="lazy"` excepto hero image
- Optimizar peso (WebP preferido)

**Ejemplos:**

```jsx
// ✅ CORRECTO
<img
  src="/hero.webp"
  alt="Equipo de Software Solutions desarrollando software a la medida"
  width={1200}
  height={600}
  loading="eager"
  fetchPriority="high"
/>

// ❌ INCORRECTO
<img src="/hero.png" />
```

**Por qué:**

- Google indexa imágenes separadamente
- Alt text es factor de ranking para búsqueda de imágenes
- Width/height previene layout shift (CLS)
- Accesibilidad para usuarios con discapacidad visual

**Validación:**

```bash
# Buscar imágenes sin alt
grep -r '<img' src/ | grep -v 'alt='
```

### 1.3.5 Enlaces Internos

**Reglas:**

- Anchor text descriptivo (no "click aquí")
- Enlaces a páginas relacionadas
- Distribución lógica de PageRank interno

**Ejemplos:**

```jsx
// ✅ CORRECTO
<Link to="/services">Conoce nuestros servicios de desarrollo de software</Link>

// ❌ INCORRECTO
<Link to="/services">Haz click aquí</Link>
<Link to="/services">Ver más</Link>
```

**Por qué:**

- Ayuda a Google a entender relaciones entre páginas
- Distribuye autoridad entre páginas
- Mejora navegación del usuario

---

## 1.4 Datos Estructurados (Schema.org)

### Objetivo

Proporcionar información estructurada a Google para rich results.

### 1.4.1 Schemas Implementados

**Organization Schema** (Home)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Software Solutions",
  "url": "https://softwaresolutions.com.mx",
  "logo": "https://softwaresolutions.com.mx/logo.png"
}
```

**WebSite Schema** (Home)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Software Solutions",
  "url": "https://softwaresolutions.com.mx"
}
```

**Service Schema** (Services)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Desarrollo de Software a la Medida",
  "provider": {
    "@type": "Organization",
    "name": "Software Solutions"
  }
}
```

**FAQPage Schema** (FAQ)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...]
}
```

**Por qué:**

- Permite rich snippets en resultados
- Mejor visibilidad en SERPs
- Mayor CTR
- Featured in Google Assistant/Voice Search

**Validación:**

- https://search.google.com/test/rich-results
- https://validator.schema.org/

### 1.4.2 Prioridad de Schemas

**Alta prioridad:**

1. Organization (marca)
2. FAQPage (rich snippets)
3. Service (claridad de oferta)

**Media prioridad:** 4. BreadcrumbList (navegación) 5. LocalBusiness (SEO local)

**Baja prioridad:** 6. Review/Rating (cuando tengamos reviews reales) 7. Article (cuando tengamos blog)

---

## 1.5 Core Web Vitals y Rendimiento

### Objetivo

Optimizar métricas de experiencia de usuario que Google usa para ranking.

### 1.5.1 Métricas Objetivo

| Métrica                        | Bueno   | Necesita Mejora | Pobre   |
| ------------------------------ | ------- | --------------- | ------- |
| LCP (Largest Contentful Paint) | < 2.5s  | 2.5-4s          | > 4s    |
| FID (First Input Delay)        | < 100ms | 100-300ms       | > 300ms |
| CLS (Cumulative Layout Shift)  | < 0.1   | 0.1-0.25        | > 0.25  |

### 1.5.2 LCP - Largest Contentful Paint

**Optimizaciones:**

- Preload hero image
- Usar `fetchPriority="high"` en hero
- Comprimir imágenes (WebP)
- Lazy load off-screen images
- Minimizar JavaScript inicial

**Implementación:**

```html
<link rel="preload" href="/hero.webp" as="image" type="image/webp" fetchpriority="high" />
```

**Validación:**

- PageSpeed Insights
- Chrome DevTools Lighthouse

### 1.5.3 CLS - Cumulative Layout Shift

**Causas comunes:**

- Imágenes sin width/height
- Fuentes web cargando tarde
- Anuncios sin espacio reservado
- Contenido dinámico inyectado

**Soluciones:**

- Declarar width/height en TODAS las imágenes
- Usar `font-display: swap` en @font-face
- Reservar espacio para contenido dinámico

**Validación:**

- Chrome DevTools Performance tab
- PageSpeed Insights

### 1.5.4 FID/INP - Interactividad

**Optimizaciones:**

- Code splitting por ruta
- Lazy load componentes pesados
- Eliminar JavaScript no usado
- Usar React.lazy()

**Ya implementado:**

```jsx
const Services = React.lazy(() => import('./pages/Services'))
```

---

## 1.6 Indexación y Rastreo

### Objetivo

Asegurar que Google puede encontrar, rastrear e indexar todas las páginas importantes.

### 1.6.1 Envío a Google Search Console

**Paso 1:** Verificar propiedad
**Paso 2:** Enviar sitemap.xml
**Paso 3:** Solicitar indexación de URLs principales
**Paso 4:** Monitorear errores de rastreo

**Frecuencia de revisión:** Semanal durante primer mes, luego mensual

### 1.6.2 Cobertura de Indexación

**Verificar en GSC:**

- Páginas enviadas vs indexadas
- Páginas excluidas y por qué
- Errores 404
- Problemas de redireccionamiento

### 1.6.3 Budget de Rastreo

**Para sitios pequeños (<100 páginas):**
No es preocupación mayor, pero evitar:

- Enlaces rotos
- Cadenas de redirecciones
- Contenido duplicado
- Parámetros de URL innecesarios

---

## 1.7 Open Graph y Redes Sociales

### Objetivo

Controlar cómo se ve el sitio cuando se comparte en redes sociales.

### 1.7.1 Open Graph Tags

**Implementado en cada página:**

```html
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Software Solutions" />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:url" content="https://softwaresolutions.com.mx/" />
<meta property="og:image" content="https://softwaresolutions.com.mx/og/og-home.svg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

### 1.7.2 Twitter Cards

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
```

### 1.7.3 Imágenes OG

**Requisitos:**

- Tamaño: 1200 × 630 px
- Formato: JPG o PNG (WebP no siempre soportado)
- Peso: < 200 KB
- Contenido: Logo + mensaje clave

**Validación:**

- https://www.opengraph.xyz/
- Facebook Sharing Debugger
- Twitter Card Validator

---

## 1.8 Medición, Validación y Seguimiento

### 1.8.1 Herramientas de Validación

**SEO Técnico:**

1. Google Search Console (errores de rastreo, cobertura)
2. Screaming Frog (auditoría completa)
3. Google PageSpeed Insights (rendimiento)
4. Mobile-Friendly Test

**Datos Estructurados:**

1. Rich Results Test
2. Schema Markup Validator

**Open Graph:**

1. OpenGraph.xyz
2. Facebook Debugger

### 1.8.2 Comandos de Verificación

**Post-deploy checklist:**

```bash
# 1. Verificar canonical
curl -s https://softwaresolutions.com.mx/ | grep 'canonical'

# 2. Verificar title
curl -s https://softwaresolutions.com.mx/ | grep '<title>'

# 3. Verificar H1
curl -s https://softwaresolutions.com.mx/ | grep '<h1'

# 4. Verificar OG tags
curl -s https://softwaresolutions.com.mx/ | grep 'og:title'

# 5. Verificar robots.txt
curl https://softwaresolutions.com.mx/robots.txt

# 6. Verificar sitemap
curl https://softwaresolutions.com.mx/sitemap.xml
```

### 1.8.3 KPIs a Monitorear

**Semana 1-4:**

- Páginas indexadas (GSC)
- Errores de rastreo (GSC)
- Cobertura de indexación (GSC)

**Mes 2-3:**

- Impresiones en búsqueda (GSC)
- Posición promedio (GSC)
- Clics desde Google (GSC)
- Core Web Vitals (GSC)

**Mes 4+:**

- Keywords rankeando (top 100, top 50, top 10)
- Tráfico orgánico (GA4)
- Conversiones desde orgánico (GA4)
- Backlinks (Ahrefs/SEMrush)

---

## 1.9 Prioridades de Implementación

### Fase 1: Fundamentos (Semana 1-2) ⚡ CRÍTICO

| Tarea                                    | Impacto | Esfuerzo | Responsable |
| ---------------------------------------- | ------- | -------- | ----------- |
| Google Search Console setup              | Alto    | Bajo     | Externo     |
| Enviar sitemap a GSC                     | Alto    | Bajo     | Externo     |
| Solicitar indexación páginas principales | Alto    | Bajo     | Externo     |
| Verificar robots.txt accesible           | Alto    | Bajo     | Dev         |
| Verificar canonical tags                 | Alto    | Bajo     | Dev         |
| Auditar estructura H1-H6                 | Alto    | Medio    | Dev         |

### Fase 2: Contenido y Estructura (Semana 3-4)

| Tarea                           | Impacto | Esfuerzo | Responsable |
| ------------------------------- | ------- | -------- | ----------- |
| Optimizar titles y descriptions | Alto    | Medio    | SEO/Dev     |
| Auditar y arreglar alt texts    | Medio   | Alto     | Dev         |
| Implementar schemas faltantes   | Alto    | Medio    | Dev         |
| Crear/optimizar OG images       | Medio   | Medio    | Diseño      |
| Optimizar enlaces internos      | Medio   | Medio    | SEO/Dev     |

### Fase 3: Rendimiento (Semana 5-6)

| Tarea                     | Impacto | Esfuerzo | Responsable |
| ------------------------- | ------- | -------- | ----------- |
| Optimizar LCP             | Alto    | Alto     | Dev         |
| Fix CLS issues            | Alto    | Medio    | Dev         |
| Code splitting adicional  | Medio   | Alto     | Dev         |
| Optimizar imágenes a WebP | Medio   | Medio    | Dev         |
| Implementar lazy loading  | Medio   | Bajo     | Dev         |

### Fase 4: Contenido y Autoridad (Mes 2+)

| Tarea                          | Impacto | Esfuerzo | Responsable |
| ------------------------------ | ------- | -------- | ----------- |
| Crear blog                     | Alto    | Alto     | SEO/Dev     |
| Escribir 4-8 artículos/mes     | Alto    | Alto     | Contenido   |
| Google My Business             | Alto    | Bajo     | Marketing   |
| Conseguir backlinks            | Alto    | Alto     | Marketing   |
| Actualizar contenido existente | Medio   | Medio    | Contenido   |

---

## 1.10 Roadmap Recomendado

### Mes 1: Fundamentos Técnicos

- ✅ Implementación SEO técnico completa
- ✅ GSC configurado y monitoreando
- ✅ Todas las páginas solicitadas para indexación
- ⚠️ Primeros datos de rendimiento

### Mes 2-3: Contenido y Optimización

- 📝 Blog implementado
- 📝 8-12 artículos publicados
- 📝 Keywords long-tail rankeando (posición 20-50)
- 📝 Primeros backlinks conseguidos

### Mes 4-6: Consolidación

- 📊 Aumento sostenido de tráfico orgánico
- 📊 Keywords en top 10 para términos long-tail
- 📊 Core Web Vitals "Good" en todas las páginas
- 📊 10+ backlinks de calidad

### Mes 7-12: Escalamiento

- 🚀 Keywords competitivas en top 20
- 🚀 Autoridad de dominio incrementada
- 🚀 Tráfico orgánico = 30%+ del total
- 🚀 Casos de éxito documentados

---

## 1.11 Expectativas Realistas de Tiempos

### ⏰ Indexación y Primeras Posiciones

**Indexación inicial:** 1-4 semanas

- Google descubre y rastrea el sitio
- Se empiezan a indexar páginas

**Primeras impresiones:** 2-6 semanas

- Apareces en búsquedas (posición 50-100)
- Muy pocas impresiones/clics

**Keywords long-tail rankeando:** 2-3 meses

- "desarrollo software a la medida chihuahua"
- "empresa desarrollo web méxico precio"
- Posición 10-30

**Keywords medias en top 20:** 6-9 meses

- "desarrollo software méxico"
- "empresa desarrollo web méxico"

**Keywords competitivas en top 10:** 12-24 meses

- "desarrollo de software"
- "software a la medida"
- Requiere trabajo constante

### 🚫 Keywords Imposibles de Rankear Pronto

- "software solutions" - demasiado genérico
- "software development" - ultra competitivo
- "software company" - millones de resultados

**Enfoque recomendado:**
Long-tail específicas → Medium-tail locales → Broad competitivas

---

## 1.12 Factores Críticos de Éxito

### ✅ Factores bajo tu control

1. **Calidad de contenido** - El más importante
2. **SEO técnico** - Debe estar perfecto
3. **Core Web Vitals** - Afecta ranking
4. **Estructura de información** - UX = SEO
5. **Consistencia** - Publicar regularmente

### ⚠️ Factores parcialmente controlables

6. **Backlinks** - Requiere outreach y relaciones
7. **Menciones de marca** - Marketing y PR
8. **Comportamiento de usuario** - CTR, time on site, bounce

### ❌ Factores fuera de control

9. **Cambios de algoritmo de Google**
10. **Competencia** - Qué hacen otros
11. **Tendencias de mercado**

---

# SECCIÓN 2: DESARROLLO - TAREAS TÉCNICAS

## 2.1 Arquitectura y Stack Actual

### Stack Tecnológico

```
Frontend: React 18 (Vite)
Routing: React Router v6 (BrowserRouter)
SEO: react-helmet-async
Traducciones: react-i18next
Deployment: Vercel
Analytics: Google Analytics, Google Tag Manager
```

### Estructura de Archivos

```
src/
├── components/
│   ├── SEO/
│   │   └── SEOHead.jsx          # Componente reutilizable SEO
│   ├── FAQ/                     # Componente FAQ con i18n
│   └── ...
├── data/
│   └── schemas.js               # JSON-LD schemas
├── pages/
│   ├── Home.jsx                 # con SEO
│   ├── Services.jsx             # con SEO
│   ├── About.jsx                # con SEO
│   ├── Contact.jsx              # con SEO
│   ├── FAQ.jsx                  # con SEO
│   └── Projects.jsx
└── main.jsx                     # Entry point con HelmetProvider

public/
├── robots.txt                   # Configuración crawlers
├── sitemap.xml                  # Mapa del sitio
├── _redirects                   # SPA routing (Vercel)
├── og/                          # Open Graph images
│   ├── og-default.svg
│   ├── og-home.svg
│   ├── og-servicios.svg
│   ├── og-nosotros.svg
│   └── og-contacto.svg
└── locales/                     # Traducciones i18n
    ├── es/
    │   ├── common.json
    │   ├── faq.json
    │   └── ...
    └── en/
        ├── common.json
        ├── faq.json
        └── ...
```

---

## 2.2 Checklist de Implementación Técnica

### ✅ Completado

- [x] React Helmet Async instalado
- [x] HelmetProvider en main.jsx
- [x] Componente SEOHead creado
- [x] Schemas JSON-LD (Organization, WebSite, Service, FAQPage)
- [x] SEOHead en páginas principales (Home, Services, About, Contact, FAQ)
- [x] robots.txt creado
- [x] sitemap.xml creado
- [x] BrowserRouter (no HashRouter)
- [x] Canonical tags en todas las páginas
- [x] Open Graph tags en todas las páginas
- [x] Twitter Card tags en todas las páginas
- [x] lang="es-MX" en HTML
- [x] FAQ page con i18n completo
- [x] \_redirects para SPA routing
- [x] Google Analytics instalado
- [x] Google Tag Manager instalado

### 🔄 Pendiente / Revisar

- [ ] Auditar estructura H1-H6 en TODAS las páginas
- [ ] Agregar alt text a TODAS las imágenes
- [ ] Agregar width/height a TODAS las imágenes
- [ ] Convertir imágenes a WebP
- [ ] Implementar lazy loading en imágenes below-fold
- [ ] Preload hero image
- [ ] Optimizar LCP
- [ ] Fix CLS issues
- [ ] Crear OG images en JPG (1200x630)
- [ ] Blog system (futuro)
- [ ] LocalBusiness schema (futuro)
- [ ] BreadcrumbList schema (futuro)

---

## 2.3 Tareas Prioritarias con Código

### 🔥 PRIORIDAD CRÍTICA

#### Tarea 2.3.1: Auditar y Corregir Estructura H1-H6

**Problema:** Algunas páginas pueden tener múltiples H1 o jerarquía incorrecta.

**Comando de auditoría:**

```bash
# Buscar todos los headings en componentes
grep -rn '<h[1-6]' src/components/ src/pages/
```

**Reglas a enforcer:**

1. Exactamente UN `<h1>` por página (debe estar en page component, NO en layout)
2. H1 contiene keyword principal
3. Jerarquía lógica (no saltar niveles)

**Ejemplo de corrección:**

```jsx
// ❌ INCORRECTO - src/components/Header/index.jsx
<header>
  <h1>Software Solutions</h1> {/* NO - esto aparece en todas las páginas */}
</header>

// ✅ CORRECTO - src/components/Header/index.jsx
<header>
  <div className="logo">Software Solutions</div>
</header>

// ✅ CORRECTO - src/pages/Home.jsx
<main>
  <h1>Desarrollo de Software a la Medida en México</h1>
  <section>
    <h2>Nuestros Servicios</h2>
    <div>
      <h3>Desarrollo Web</h3>
      <h3>Sistemas ERP</h3>
    </div>
  </section>
</main>
```

**Validación:**

```bash
# En producción
curl -s https://softwaresolutions.com.mx/ | grep -c '<h1'
# Debe retornar: 1

curl -s https://softwaresolutions.com.mx/ | grep '<h1'
# Debe mostrar el H1 correcto con keyword
```

---

#### Tarea 2.3.2: Alt Text en TODAS las Imágenes

**Comando de auditoría:**

```bash
# Buscar imágenes sin alt
grep -rn '<img' src/ | grep -v 'alt=' > images_without_alt.txt
```

**Reglas:**

- Imagen decorativa → `alt=""` + `role="presentation"`
- Imagen con contenido → `alt="descripción específica con keywords naturales"`
- Logo → `alt="Software Solutions logo"`
- Iconos informativos → Descripción clara

**Ejemplo:**

```jsx
// ❌ INCORRECTO
<img src="/hero.jpg" />
<img src="/icon.svg" alt="" /> {/* Solo si es puramente decorativo */}

// ✅ CORRECTO
<img
  src="/hero.webp"
  alt="Equipo de Software Solutions desarrollando aplicaciones empresariales"
  width={1200}
  height={600}
  loading="eager"
/>

<img
  src="/service-web.jpg"
  alt="Desarrollo de aplicaciones web modernas con React y Node.js"
  width={600}
  height={400}
  loading="lazy"
/>

<img
  src="/divider.svg"
  alt=""
  role="presentation"
/>
```

**Script de ayuda para encontrar imágenes:**

```bash
# Listar todas las rutas de imágenes
find public/img -type f -name "*.jpg" -o -name "*.png" -o -name "*.svg" -o -name "*.webp"
```

---

#### Tarea 2.3.3: Width y Height en TODAS las Imágenes

**Por qué crítico:** Previene CLS (Cumulative Layout Shift)

**Comando de auditoría:**

```bash
# Buscar imágenes sin width
grep -rn '<img' src/ | grep -v 'width=' > images_without_dimensions.txt
```

**Solución:**

```jsx
// Obtener dimensiones de imagen
const getImageDimensions = (imagePath) => {
  // Usar ImageMagick o inspeccionar manualmente
  console.log('Dimensiones de', imagePath)
}

// En cada imagen:
;<img
  src="/image.jpg"
  alt="Descripción"
  width={800} // ← Dimensión real de la imagen
  height={600} // ← Dimensión real de la imagen
  loading="lazy"
/>
```

**Para imágenes responsive:**

```jsx
// Opción 1: Mantener aspect ratio con CSS
<img
  src="/image.jpg"
  alt="Descripción"
  width={800}
  height={600}
  style={{ width: '100%', height: 'auto' }}
/>

// Opción 2: Usar aspect-ratio CSS
<img
  src="/image.jpg"
  alt="Descripción"
  width={800}
  height={600}
  className="responsive-img"
/>

// CSS:
// .responsive-img {
//   width: 100%;
//   height: auto;
//   aspect-ratio: 4 / 3;
// }
```

---

### ⚡ PRIORIDAD ALTA

#### Tarea 2.3.4: Optimizar Hero Image (LCP)

**Objetivo:** Hero image es frecuentemente el LCP element.

**Implementación:**

```jsx
// src/pages/Home.jsx
import { Helmet } from 'react-helmet-async'

const Home = () => (
  <>
    <Helmet>
      {/* Preload hero image */}
      <link
        rel="preload"
        href="/img/intro/hero-main.webp"
        as="image"
        type="image/webp"
        fetchpriority="high"
      />
    </Helmet>

    <section className="hero">
      <img
        src="/img/intro/hero-main.webp"
        alt="Desarrollo de software empresarial en México"
        width={1920}
        height={1080}
        loading="eager"
        fetchpriority="high"
        decoding="async"
      />
    </section>
  </>
)
```

**Validación:**

- PageSpeed Insights debe mostrar LCP < 2.5s
- Chrome DevTools → Network → debe ver preload funcionando

---

#### Tarea 2.3.5: Convertir Imágenes a WebP

**Por qué:** WebP es 25-35% más liviano que JPG/PNG

**Proceso:**

```bash
# Instalar herramienta
brew install webp  # macOS
# o
sudo apt-get install webp  # Linux

# Convertir imagen única
cwebp -q 85 input.jpg -o output.webp

# Convertir todas las JPG en un directorio
for file in public/img/**/*.jpg; do
  cwebp -q 85 "$file" -o "${file%.jpg}.webp"
done

# Para PNG (preservar transparencia)
cwebp -q 90 input.png -o output.webp
```

**Uso en componentes:**

```jsx
// Con fallback para navegadores antiguos
<picture>
  <source srcSet="/image.webp" type="image/webp" />
  <img src="/image.jpg" alt="Descripción" width={800} height={600} />
</picture>
```

---

#### Tarea 2.3.6: Lazy Loading Correcto

**Regla:**

- Primera imagen visible (hero) → `loading="eager"`
- Todas las demás → `loading="lazy"`

**Implementación:**

```jsx
// Hero image (above the fold)
<img
  src="/hero.webp"
  loading="eager"
  fetchpriority="high"
/>

// Todas las demás imágenes
<img
  src="/image.webp"
  loading="lazy"
  fetchpriority="low"
/>
```

**Validación:**

```bash
# Verificar que lazy loading está implementado
grep -rn 'loading=' src/ | grep -v 'lazy\|eager'
# No debe retornar nada
```

---

### 📊 PRIORIDAD MEDIA

#### Tarea 2.3.7: Crear OG Images Profesionales

**Estado actual:** Tenemos SVG placeholders
**Necesario:** Crear JPG profesionales 1200×630

**Especificaciones:**

- Tamaño: 1200 × 630 px (ratio 1.91:1)
- Formato: JPG (no SVG, algunas plataformas no lo soportan)
- Peso: < 200 KB
- Contenido: Logo + mensaje clave + fondo branded

**Archivos a crear:**

```
public/og/
├── og-default.jpg         # Logo + "Tu socio tecnológico en México"
├── og-home.jpg            # "Desarrollo de Software a la Medida"
├── og-servicios.jpg       # "Nuestros Servicios de Software"
├── og-nosotros.jpg        # "Quiénes Somos"
└── og-contacto.jpg        # "Hablemos de tu Proyecto"
```

**Herramientas recomendadas:**

- Canva (template "Facebook Post")
- Figma
- Photoshop
- https://og-playground.vercel.app/

**Una vez creados, actualizar rutas:**

```jsx
// src/components/SEO/SEOHead.jsx
const SEOHead = ({
  ogImage = 'https://softwaresolutions.com.mx/og/og-default.jpg', // ← cambiar .svg a .jpg
  // ...
}) => {
```

**Validación:**

- https://www.opengraph.xyz/
- Facebook Sharing Debugger
- Twitter Card Validator

---

#### Tarea 2.3.8: Implementar Blog (Futuro)

**Estructura sugerida:**

```
src/
├── pages/
│   ├── Blog.jsx              # Lista de artículos
│   └── BlogPost.jsx          # Artículo individual
├── data/
│   └── blog-posts.js         # Metadata de posts
└── content/
    └── blog/                 # Archivos markdown
        ├── post-1.md
        └── post-2.md
```

**Routing:**

```jsx
// src/App.jsx
<Route path="/blog" element={<Blog />} />
<Route path="/blog/:slug" element={<BlogPost />} />
```

**SEO para blog posts:**

```jsx
// src/pages/BlogPost.jsx
import { useParams } from 'react-router-dom'
import SEOHead from '../components/SEO/SEOHead'

const BlogPost = () => {
  const { slug } = useParams()
  const post = getPostBySlug(slug)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    author: {
      '@type': 'Organization',
      name: 'Software Solutions',
    },
    datePublished: post.publishedDate,
    dateModified: post.modifiedDate,
    image: post.featuredImage,
  }

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt}
        canonical={`/blog/${slug}`}
        ogImage={post.featuredImage}
        ogType="article"
        schema={articleSchema}
      />
      <article>
        <h1>{post.title}</h1>
        {/* contenido */}
      </article>
    </>
  )
}
```

---

## 2.4 Configuración de Build y Deploy

### Configuración Actual

**package.json:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "postbuild:local": "react-snap", // Deshabilitado en Vercel
    "preview": "vite preview"
  },
  "reactSnap": {
    "source": "dist",
    "destination": "dist",
    "include": ["/", "/services", "/about", "/contact", "/projects", "/faq"]
  }
}
```

**Problema con react-snap en Vercel:**

- Puppeteer requiere dependencias del sistema no disponibles
- Build falla en Vercel

**Solución implementada:**

- React-snap solo para builds locales
- Vercel usa solo `vite build`
- Meta tags dinámicos con react-helmet-async funcionan bien para SEO moderno

**Alternativa futura (si se necesita prerendering):**

1. Migrar a Next.js (SSR/SSG nativo)
2. Usar Prerender.io (servicio externo)
3. Implementar SSR custom con Express

---

## 2.5 Testing y Validación Técnica

### Script de Validación Post-Deploy

Crear archivo: `scripts/validate-seo.sh`

```bash
#!/bin/bash

SITE_URL="https://softwaresolutions.com.mx"
PAGES=("/" "/services" "/about" "/contact" "/faq" "/projects")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SEO VALIDATION CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test robots.txt
echo "✓ Testing robots.txt..."
curl -s "${SITE_URL}/robots.txt" | head -n 5
echo ""

# Test sitemap.xml
echo "✓ Testing sitemap.xml..."
curl -s "${SITE_URL}/sitemap.xml" | grep -c "<url>"
echo "URLs found in sitemap"
echo ""

# Test each page
for page in "${PAGES[@]}"; do
  echo "━━━ Testing: ${page} ━━━"

  # Title
  echo -n "Title: "
  curl -s "${SITE_URL}${page}" | grep -o '<title>.*</title>'

  # Canonical
  echo -n "Canonical: "
  curl -s "${SITE_URL}${page}" | grep -o 'rel="canonical" href="[^"]*"'

  # H1
  echo -n "H1: "
  curl -s "${SITE_URL}${page}" | grep -o '<h1[^>]*>.*</h1>' | head -n 1

  # OG Image
  echo -n "OG Image: "
  curl -s "${SITE_URL}${page}" | grep -o 'property="og:image" content="[^"]*"'

  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Validation complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

**Uso:**

```bash
chmod +x scripts/validate-seo.sh
./scripts/validate-seo.sh
```

---

## 2.6 Comandos Útiles para Desarrollo

### Auditoría Local

```bash
# Buscar TODOs relacionados con SEO
grep -rn 'TODO.*SEO' src/

# Listar todos los componentes que usan imágenes
grep -rn '<img' src/ --include="*.jsx"

# Contar cuántas imágenes hay sin alt
grep -rn '<img' src/ | grep -v 'alt=' | wc -l

# Buscar links externos sin rel
grep -rn '<a href="http' src/ | grep -v 'rel='

# Buscar H1 duplicados
grep -rn '<h1' src/

# Ver qué páginas tienen SEOHead
grep -rn 'SEOHead' src/pages/
```

### Build y Test Local

```bash
# Build de producción
npm run build

# Preview del build
npm run preview

# Test de lighthouse local
npx lighthouse http://localhost:4173 --view

# Test de accesibilidad
npx pa11y http://localhost:4173
```

---

## 2.7 Checklist Pre-Deploy

Antes de cada deploy a producción, verificar:

- [ ] `npm run build` exitoso sin warnings
- [ ] Todas las rutas funcionan en preview
- [ ] No hay console.errors en browser
- [ ] Lighthouse score > 90 (Performance, SEO, Accessibility)
- [ ] Meta tags visibles en view-source
- [ ] OG tags válidos (test con validator)
- [ ] Schemas válidos (test con Rich Results Test)
- [ ] Todas las imágenes tienen alt text
- [ ] No hay enlaces rotos
- [ ] Forms funcionan correctamente
- [ ] i18n funciona en todos los idiomas
- [ ] Mobile responsive OK
- [ ] No hay errores en get_errors

---

# SECCIÓN 3: CUENTAS Y CONFIGURACIÓN EXTERNA

## 3.1 Instrucciones para el Agente Claude Desktop

### 🚨 REGLA OBLIGATORIA

**ANTES de crear cualquier cuenta o configuración nueva:**

```
⚠️ AGENTE: Debes preguntar primero:

"¿Ya existe una cuenta de [SERVICIO]? Si existe, proporciona:
- Email de acceso
- URL de la cuenta/property
- Credenciales necesarias

Si NO existe, confirma que debo crear una nueva."
```

**No crear cuentas duplicadas sin confirmar primero.**

---

## 3.2 Google Search Console (CRÍTICO - Prioridad 1)

### Verificar Cuenta Existente

**Preguntar:**

- ¿Ya tienes cuenta en Google Search Console?
- ¿Ya está agregado softwaresolutions.com.mx?
- ¿Qué email de Google se usó?

### Si NO existe → Crear Nueva

**Paso 1: Acceder**

```
URL: https://search.google.com/search-console/
Usar cuenta de Google del negocio
```

**Paso 2: Agregar Propiedad**

```
1. Click "Agregar propiedad"
2. Seleccionar "Prefijo de URL"
3. Ingresar: https://softwaresolutions.com.mx
4. Click "Continuar"
```

**Paso 3: Verificar Propiedad**

**Método recomendado: HTML tag**

```
1. GSC muestra un meta tag como:
   <meta name="google-site-verification" content="ABC123XYZ..." />

2. Agregar este tag en index.html dentro de <head>

3. Hacer commit y deploy

4. Regresar a GSC y click "Verificar"
```

**Método alternativo: DNS**

```
1. GSC proporciona un TXT record
2. Agregar en configuración de DNS del dominio
3. Esperar propagación (5-30 minutos)
4. Click "Verificar" en GSC
```

**Paso 4: Enviar Sitemap**

```
1. En GSC, ir a "Sitemaps" en menú izquierdo
2. Ingresar: sitemap.xml
3. Click "Enviar"
4. Verificar que aparezca como "Éxito"
```

**Paso 5: Solicitar Indexación de URLs**

```
Para cada URL principal:
1. Ir a "Inspección de URLs"
2. Ingresar URL completa (ej: https://softwaresolutions.com.mx/)
3. Click "Enter"
4. Click "Solicitar indexación"

URLs a indexar:
- https://softwaresolutions.com.mx/
- https://softwaresolutions.com.mx/services
- https://softwaresolutions.com.mx/about
- https://softwaresolutions.com.mx/contact
- https://softwaresolutions.com.mx/faq
- https://softwaresolutions.com.mx/projects
```

### Monitoreo Semanal (Primera 4 semanas)

**Verificar en GSC:**

- Cobertura → Páginas indexadas vs excluidas
- Rendimiento → Impresiones, clics, posición promedio
- Experiencia → Core Web Vitals
- Mejoras → Usabilidad móvil, datos estructurados

**Registrar en documento:**

```
Semana 1: X páginas indexadas, Y impresiones
Semana 2: X páginas indexadas, Y impresiones
Semana 3: ...
```

---

## 3.3 Google Analytics 4 (Ya implementado - Verificar)

### Verificar Implementación Existente

**Preguntar:**

- ¿Ya existe cuenta de Google Analytics?
- ¿Cuál es el Measurement ID? (formato: G-XXXXXXXXXX)
- ¿Está recibiendo datos?

**Verificar en código:**

```javascript
// index.html debe contener:
<script async src="https://www.googletagmanager.com/gtag/js?id=G-G4M48VDFN6"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-G4M48VDFN6');
</script>
```

### Si existe → Validar

**Abrir en navegador:**

```
URL: https://analytics.google.com/
Property: softwaresolutions.com.mx
```

**Verificar:**

- [ ] Datos de tráfico actualizados
- [ ] Eventos personalizados configurados
- [ ] Conversiones definidas
- [ ] Audiencias creadas (si aplica)

**Test en vivo:**

```
1. Abrir: https://softwaresolutions.com.mx/
2. En GA4, ir a "Realtime"
3. Verificar que aparece 1 usuario activo
4. Navegar entre páginas
5. Verificar que se registran las pageviews
```

### Configuración Recomendada

**Eventos importantes a trackear:**

```javascript
// Formulario de contacto enviado
gtag('event', 'generate_lead', {
  form_name: 'contact_form',
})

// Click en botón CTA
gtag('event', 'click', {
  event_category: 'CTA',
  event_label: 'Solicitar Cotización',
})

// Descarga de recurso (si aplica)
gtag('event', 'file_download', {
  file_name: 'brochure.pdf',
})
```

---

## 3.4 Google Tag Manager (Ya implementado - Verificar)

### Verificar Implementación Existente

**ID del contenedor:** GTM-MQL3BCCW

**Verificar en código (index.html):**

```html
<!-- Debe estar en <head> -->
<script>
  ;(function (w, d, s, l, i) {
    w[l] = w[l] || []
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != 'dataLayer' ? '&l=' + l : ''
    j.async = true
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl
    f.parentNode.insertBefore(j, f)
  })(window, document, 'script', 'dataLayer', 'GTM-MQL3BCCW')
</script>

<!-- Debe estar después de <body> -->
<noscript
  ><iframe
    src="https://www.googletagmanager.com/ns.html?id=GTM-MQL3BCCW"
    height="0"
    width="0"
    style="display:none;visibility:hidden"
  ></iframe
></noscript>
```

### Acceder a GTM

```
URL: https://tagmanager.google.com/
Contenedor: GTM-MQL3BCCW
```

### Configuración Recomendada en GTM

**Tags a crear:**

1. **Scroll Depth Tracking**

```
Type: Custom HTML
Trigger: All Pages
HTML:
<script>
// Track scroll depth at 25%, 50%, 75%, 100%
// (código de tracking proporcionado por GTM Gallery)
</script>
```

2. **Form Submit Tracking**

```
Type: GA4 Event
Event Name: form_submit
Trigger: Form Submission - Contact Form
```

3. **Outbound Link Tracking**

```
Type: GA4 Event
Event Name: click
Trigger: Click - Just Links > Click URL contains http AND NOT softwaresolutions.com.mx
```

**Test de GTM:**

```
1. Activar "Preview" mode en GTM
2. Abrir: https://softwaresolutions.com.mx/
3. Verificar que GTM debugger detecta el contenedor
4. Realizar acciones (scroll, clicks, form)
5. Verificar que los eventos se disparan
```

---

## 3.5 Bing Webmaster Tools (Opcional - Mes 2)

### Crear Cuenta

```
URL: https://www.bing.com/webmasters/
Usar cuenta Microsoft o crear nueva
```

### Agregar Sitio

```
1. Click "Add a site"
2. Ingresar: https://softwaresolutions.com.mx
3. Método de verificación: XML file o meta tag
4. Verificar sitio
5. Enviar sitemap: https://softwaresolutions.com.mx/sitemap.xml
```

**¿Vale la pena?**

- Bing tiene ~3-5% del mercado de búsqueda
- Útil para cobertura completa
- Configuración rápida (15 minutos)
- Prioridad: Baja (hacer después de GSC)

---

## 3.6 Herramientas de Validación

### Rich Results Test (Google)

**URL:** https://search.google.com/test/rich-results

**Uso:**

```
1. Ingresar URL de página con schemas
   Ej: https://softwaresolutions.com.mx/

2. Click "Test URL"

3. Esperar resultados

4. Verificar:
   - ✅ Schemas detectados correctamente
   - ✅ No hay errores
   - ⚠️ Advertencias (revisar si son críticas)
   - ❌ Errores (corregir inmediatamente)

5. Probar para:
   - / (Organization, WebSite, FAQPage schemas)
   - /services (Service schema)
   - /faq (FAQPage schema)
```

**Screenshots de validación:**

- Tomar captura de cada resultado exitoso
- Guardar en carpeta del proyecto: `docs/seo-validation/`

---

### Schema Markup Validator

**URL:** https://validator.schema.org/

**Uso:**

```
1. Copiar JSON-LD de schemas.js
2. Pegar en validator
3. Verificar que no hay errores
4. Verificar que todos los campos requeridos están presentes
```

---

### Mobile-Friendly Test

**URL:** https://search.google.com/test/mobile-friendly

**Uso:**

```
1. Ingresar URL: https://softwaresolutions.com.mx/
2. Click "Test URL"
3. Debe pasar test
4. Si falla, revisar issues reportados
```

---

### PageSpeed Insights

**URL:** https://pagespeed.web.dev/

**Uso:**

```
1. Ingresar URL de cada página
2. Analizar para Mobile y Desktop
3. Revisar Core Web Vitals
4. Identificar oportunidades de optimización

Objetivo:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90
```

**Páginas prioritarias a analizar:**

- / (Home)
- /services
- /contact

---

### OpenGraph Debugger

**URLs:**

- https://www.opengraph.xyz/
- https://developers.facebook.com/tools/debug/
- https://cards-dev.twitter.com/validator

**Uso:**

```
1. Ingresar URL de página
2. Verificar preview
3. Confirmar:
   - Imagen OG se muestra correctamente
   - Título es el correcto
   - Descripción es la correcta
   - No hay errores

4. Para Facebook Debugger:
   - Click "Fetch new scrape info"
   - Esto refresca cache de Facebook
```

---

## 3.7 Debugging en Navegador - Protocolo para Agente

### Objetivo

El agente Claude Desktop debe poder:

1. Abrir el sitio en navegador real
2. Inspeccionar el HTML renderizado
3. Verificar que SEO está implementado correctamente
4. Detectar errores o implementaciones incompletas
5. Documentar hallazgos

### Herramientas Necesarias

**Extensiones de Chrome recomendadas:**

- SEO Meta in 1 Click
- Lighthouse
- META SEO inspector
- SEOquake

### Protocolo de Validación Paso a Paso

#### Paso 1: Inspección Visual

```
1. Abrir: https://softwaresolutions.com.mx/

2. Verificar:
   - [ ] Sitio carga completamente (no loading infinito)
   - [ ] No hay errores visibles
   - [ ] Contenido es legible
   - [ ] Imágenes cargan correctamente
   - [ ] Navegación funciona
```

#### Paso 2: View Source (Ver Código Fuente)

```
1. Click derecho → "View Page Source"
   O: ⌘+Option+U (Mac) / Ctrl+U (Windows)

2. Buscar (Ctrl+F):

   a) Title tag:
      Buscar: <title>
      ✅ Debe existir
      ✅ Debe ser único
      ✅ Debe contener keywords

   b) Meta description:
      Buscar: <meta name="description"
      ✅ Debe existir
      ✅ Debe tener 150-160 caracteres

   c) Canonical:
      Buscar: rel="canonical"
      ✅ Debe existir
      ✅ Debe ser URL absoluta (https://)

   d) Open Graph:
      Buscar: og:title
      ✅ Debe existir
      ✅ Buscar: og:image
      ✅ Buscar: og:description

   e) Lang attribute:
      Buscar: <html lang=
      ✅ Debe ser: lang="es-MX"

   f) H1:
      Buscar: <h1
      ✅ Debe existir UNA vez
      ✅ Debe contener keyword
```

#### Paso 3: Inspect Element (Inspeccionar Elemento)

```
1. Click derecho en página → "Inspect"
   O: ⌘+Option+I (Mac) / Ctrl+Shift+I (Windows)

2. Tab "Elements":
   - Expandir <head>
   - Verificar meta tags están presentes
   - Expandir <body>
   - Buscar <h1> en DOM
   - Contar cuántos H1 hay (debe ser 1)

3. Tab "Console":
   - Verificar que NO hay errores rojos
   - Warnings amarillos son OK generalmente
   - Si hay errores, copiar y documentar

4. Tab "Network":
   - Reload página (⌘+R / Ctrl+R)
   - Verificar que no hay recursos 404
   - Verificar tiempos de carga
   - Buscar: gtag (debe cargar si GA está instalado)
   - Buscar: gtm (debe cargar si GTM está instalado)

5. Tab "Lighthouse":
   - Click "Generate report"
   - Seleccionar: Mobile, All categories
   - Esperar resultados
   - Documentar scores:
     * Performance: __/100
     * Accessibility: __/100
     * Best Practices: __/100
     * SEO: __/100
```

#### Paso 4: Validación de JSON-LD

```
1. En "View Source", buscar:
   <script type="application/ld+json">

2. Copiar el JSON completo

3. Ir a: https://validator.schema.org/

4. Pegar el JSON

5. Verificar resultados:
   ✅ No errors
   ⚠️ Warnings (revisar)
   ❌ Errors (copiar mensaje, reportar a dev)

6. Repetir para cada tipo de schema en la página
```

#### Paso 5: Test Mobile

```
1. En DevTools, toggle device toolbar
   (icono de móvil arriba izquierda)

2. Seleccionar: iPhone 12 Pro

3. Verificar:
   - [ ] Contenido se ve correctamente
   - [ ] No hay desbordamiento horizontal
   - [ ] Texto es legible sin zoom
   - [ ] Botones son clickeables
   - [ ] Menú responsive funciona

4. Tomar screenshot de cualquier problema
```

#### Paso 6: Test de Velocidad

```
1. Abrir: https://pagespeed.web.dev/

2. Ingresar URL: https://softwaresolutions.com.mx/

3. Esperar resultados (puede tardar 1-2 min)

4. Documentar:
   Mobile:
   - Performance: __/100
   - FCP: __s
   - LCP: __s
   - CLS: __

   Desktop:
   - Performance: __/100
   - FCP: __s
   - LCP: __s
   - CLS: __

5. Si Performance < 90:
   - Revisar "Opportunities"
   - Documentar las 3 principales oportunidades
   - Reportar a dev team
```

#### Paso 7: Validación Cross-Browser

```
Probar al menos en:
1. Chrome (principal)
2. Safari (importante para Mac/iOS)
3. Firefox (verificar compatibilidad)

En cada uno:
- [ ] Sitio carga
- [ ] No hay errores en console
- [ ] Contenido visible
- [ ] Funcionalidad básica OK
```

---

### Reporte de Validación

**Crear documento:**
`SEO_VALIDATION_REPORT_[FECHA].md`

**Template:**

```markdown
# Reporte de Validación SEO

Fecha: [fecha]
URL Base: https://softwaresolutions.com.mx
Validador: [nombre del agente/persona]

## Resumen Ejecutivo

- ✅ X elementos correctos
- ⚠️ Y advertencias menores
- ❌ Z errores críticos

## Validación Técnica

### Página: Home (/)

**Title:** [título encontrado]

- ✅/❌ Correcto / Falta / Incorrecto

**Meta Description:** [descripción encontrada]

- ✅/❌ Correcta / Falta / Muy larga

**Canonical:** [URL encontrada]

- ✅/❌ Correcto / Falta / Relativo (debe ser absoluto)

**H1:** [H1 encontrado]

- ✅/❌ Uno solo / Múltiples / Falta

**Open Graph:**

- og:title: ✅/❌
- og:image: ✅/❌
- og:description: ✅/❌

**JSON-LD Schemas:**

- Organization: ✅/❌
- WebSite: ✅/❌
- FAQPage: ✅/❌

**Lighthouse Scores:**

- Performance: \_\_/100
- SEO: \_\_/100
- Accessibility: \_\_/100

**Problemas Encontrados:**

1. [Descripción del problema]
2. [Descripción del problema]

---

### Página: Services (/services)

[Repetir estructura]

---

## Validación de Analytics

**Google Analytics:**

- ✅/❌ Script cargando
- ✅/❌ Pageviews registrándose
- ✅/❌ Eventos funcionando

**Google Tag Manager:**

- ✅/❌ Contenedor cargando
- ✅/❌ Preview mode funciona
- ✅/❌ Datos layer visible

---

## Acciones Requeridas

### Críticas (corregir inmediatamente)

1. [Acción]
2. [Acción]

### Importantes (corregir esta semana)

1. [Acción]
2. [Acción]

### Mejoras (nice to have)

1. [Acción]
2. [Acción]

---

## Screenshots

[Adjuntar capturas de problemas encontrados]
```

---

## 3.8 Monitoreo Continuo y Alertas

### Google Search Console Alerts

**Configurar notificaciones:**

```
1. En GSC, ir a Settings (⚙️)
2. Email notifications
3. Activar:
   - ✅ Critical site errors
   - ✅ Manual actions
   - ✅ Security issues
   - ⚠️ New issues found (puede ser ruidoso)
```

### Core Web Vitals Monitoring

**Configurar alertas en GA4:**

```
1. Admin → Property → Custom Definitions
2. Crear custom events para:
   - LCP > 2.5s
   - CLS > 0.1
   - FID > 100ms
3. Crear alertas cuando estos eventos aumenten
```

### Uptime Monitoring

**Herramienta recomendada:**

- **UptimeRobot** (gratuito): https://uptimerobot.com/
- **Pingdom** (trial gratuito)

**Configuración:**

```
1. Agregar monitor para: https://softwaresolutions.com.mx
2. Intervalo: 5 minutos
3. Alertas vía email
4. Agregar /services, /contact también
```

---

## 3.9 Checklist de Cuenta Externa Completo

### ✅ Completado (Estado Actual)

- [x] Google Analytics instalado (G-G4M48VDFN6)
- [x] Google Tag Manager instalado (GTM-MQL3BCCW)
- [x] Dominio en producción (softwaresolutions.com.mx)
- [x] SSL certificado activo

### 🔄 Pendiente (Prioridad Alta)

- [ ] Google Search Console configurado
- [ ] Sitemap enviado a GSC
- [ ] Páginas principales solicitadas para indexación
- [ ] Verificación HTML implementada
- [ ] Monitoreo semanal GSC configurado

### 📅 Pendiente (Prioridad Media - Mes 2)

- [ ] Bing Webmaster Tools configurado
- [ ] Google My Business perfil creado
- [ ] UptimeRobot monitoring configurado
- [ ] Hotjar o herramienta de heatmaps (opcional)

### 📊 Pendiente (Prioridad Baja - Mes 3+)

- [ ] SEMrush o Ahrefs cuenta (backlink monitoring)
- [ ] Google Data Studio dashboard (reporting)
- [ ] Schema.org auto-validation en CI/CD
- [ ] Automated SEO testing en pipeline

---

## 3.10 Calendario de Revisión

### Semanal (Primeras 4 semanas)

**Lunes:**

- Revisar GSC cobertura
- Verificar nuevas páginas indexadas
- Revisar errores de rastreo

**Miércoles:**

- Revisar GA4 métricas clave
- Analizar tráfico orgánico
- Revisar conversiones

**Viernes:**

- Ejecutar validación técnica
- Test de PageSpeed Insights
- Documentar cambios de la semana

### Mensual (Mes 2+)

**Primera semana:**

- Reporte SEO completo
- Análisis de keywords rankeando
- Revisión de backlinks
- Planificación contenido próximo mes

**Segunda semana:**

- Auditoría técnica completa
- Test de todos los validators
- Actualizar documentación

**Tercera semana:**

- Análisis de competencia
- Identificar nuevas oportunidades
- Ajustes estratégicos

**Cuarta semana:**

- Review de métricas vs objetivos
- Planning para próximo mes
- Actualizar roadmap si es necesario

---

## 3.11 Documentación de Accesos

**Crear archivo:** `SEO_ACCOUNTS.md` (NO commitear a git)

```markdown
# Cuentas y Accesos SEO - Software Solutions

## Google Search Console

- URL: https://search.google.com/search-console/
- Property: https://softwaresolutions.com.mx
- Email: [email]
- Password: [usar password manager]
- Fecha creación: [fecha]
- Método verificación: HTML meta tag

## Google Analytics

- URL: https://analytics.google.com/
- Property: softwaresolutions.com.mx
- Measurement ID: G-G4M48VDFN6
- Email: [email]
- Fecha configuración: [fecha]

## Google Tag Manager

- URL: https://tagmanager.google.com/
- Container ID: GTM-MQL3BCCW
- Email: [email]
- Fecha configuración: [fecha]

## Bing Webmaster Tools

- URL: https://www.bing.com/webmasters/
- Email: [email]
- Fecha configuración: [fecha]

## UptimeRobot

- URL: https://uptimerobot.com/
- Email: [email]
- Fecha configuración: [fecha]

## Notas

- Todos los accesos se gestionan con [password manager]
- Recovery email: [email de recuperación]
- 2FA habilitado en todas las cuentas: Sí/No
```

---

**FIN DE LA GUÍA**

Esta guía debe ser revisada y actualizada cada 3 meses o cuando haya cambios significativos en la estrategia SEO o en los algoritmos de Google.

**Última actualización:** 18 de Marzo, 2026  
**Próxima revisión programada:** 18 de Junio, 2026  
**Responsable:** [Nombre del SEO Manager / Product Owner]

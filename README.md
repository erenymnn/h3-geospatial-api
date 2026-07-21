<p align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.3.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/H3-Uber-276EF1?style=for-the-badge&logo=uber&logoColor=white" />
  <img src="https://img.shields.io/badge/Leaflet.js-Map-199900?style=for-the-badge&logo=leaflet&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

<h1 align="center">⬡ H3 Geospatial Core Service</h1>

<p align="center">
  Uber'in <a href="https://h3geo.org/">H3 Hexagonal Hierarchical Spatial Index</a> sistemi üzerine inşa edilmiş,<br/>
  <b>12 REST endpoint</b> ve interaktif harita dashboard'u içeren geospatial mikro servis.
</p>

---

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Özellikler](#-özellikler)
- [Mimari](#-mimari)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Kurulum](#-kurulum)
- [API Dokümantasyonu](#-api-dokümantasyonu)
  - [Core İşlemleri](#core-i̇şlemleri)
  - [Geometri İşlemleri](#geometri-i̇şlemleri)
  - [Mekânsal İşlemler](#mekânsal-i̇şlemler)
- [Dashboard Arayüzü](#-dashboard-arayüzü)
- [Proje Yapısı](#-proje-yapısı)

---

## 🔍 Proje Hakkında

**H3 Geospatial Core Service**, dünya yüzeyini altıgen (hexagonal) hücrelere bölen Uber H3 indeksleme sistemini REST API olarak sunar. Konum tabanlı uygulamalar, geofencing, teslimat bölgesi optimizasyonu ve mekânsal analiz gibi kullanım alanlarına yönelik tasarlanmıştır.

Proje, backend API'nin yanı sıra **Leaflet.js** tabanlı interaktif bir dashboard içerir. Dashboard üzerinden tüm endpoint'ler test edilebilir ve sonuçlar harita üzerinde görselleştirilir.

---

## ✨ Özellikler

| Kategori | Özellik |
|----------|---------|
| **Core** | Koordinat → H3 hücre dönüşümü, üst/alt hücre navigasyonu, çözünürlük dönüştürme |
| **Geometri** | Hücre sınır koordinatları, alan/kenar metrikleri, poligon/bbox/daire ile alan doldurma |
| **Mekânsal** | Komşu hücre bulma, K-Ring halkası, grid mesafesi hesaplama |
| **Dashboard** | Dark theme UI, Leaflet.js harita görselleştirme, gerçek zamanlı JSON yanıt görüntüleme |
| **Validasyon** | Bean Validation ile request doğrulama (enlem/boylam aralıkları, çözünürlük limitleri) |

---

## 🏗 Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Dashboard)                      │
│              HTML + CSS + JavaScript + Leaflet.js            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP REST
┌────────────────────────▼────────────────────────────────────┐
│                   Spring Boot 3.3.0                          │
│  ┌──────────────┐  ┌───────────────────┐  ┌──────────────┐  │
│  │ H3Core       │  │ H3Geometry        │  │ H3Spatial    │  │
│  │ Controller   │  │ Controller        │  │ Controller   │  │
│  └──────┬───────┘  └────────┬──────────┘  └──────┬───────┘  │
│         │                   │                     │          │
│  ┌──────▼───────┐  ┌───────▼──────────┐  ┌──────▼───────┐  │
│  │ H3Core       │  │ H3Geometry       │  │ H3Spatial    │  │
│  │ Service      │  │ Service          │  │ Service      │  │
│  └──────┬───────┘  └────────┬─────────┘  └──────┬───────┘  │
│         └──────────────┬────┘───────────────────┘           │
│                   ┌────▼────┐                                │
│                   │ H3Core  │  (Uber H3 v4.1.1)             │
│                   └─────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Teknoloji Yığını

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| **Runtime** | Java | 21 |
| **Framework** | Spring Boot | 3.3.0 |
| **H3 Library** | Uber H3 (h3-java) | 4.1.1 |
| **Validasyon** | Jakarta Bean Validation | — |
| **Utility** | Lombok | — |
| **Build** | Maven | — |
| **Harita** | Leaflet.js | 1.9.4 |
| **Tile Provider** | CartoDB Dark Matter | — |
| **Font** | Inter, JetBrains Mono | — |

---

## 🚀 Kurulum

### Gereksinimler

- **Java 21** veya üzeri
- **Maven 3.8+** (veya proje içindeki `mvnw` wrapper)

### Adımlar

```bash
# 1. Repoyu klonlayın
git clone https://github.com/<kullanıcı-adınız>/h3-service.git
cd h3-service

# 2. Projeyi derleyin
./mvnw clean install

# 3. Uygulamayı başlatın
./mvnw spring-boot:run
```

> Windows için `mvnw.cmd` kullanın: `mvnw.cmd spring-boot:run`

Uygulama başlatıldıktan sonra:

- **Dashboard:** [http://localhost:8080](http://localhost:8080)
- **API Base:** [http://localhost:8080/api/h3](http://localhost:8080/api/h3)

---

## 📖 API Dokümantasyonu

### Core İşlemleri

#### `GET` /api/h3/cell — Koordinattan H3 Hücre Adresi Bulma

```bash
curl "http://localhost:8080/api/h3/cell?lat=41.0166&lng=29.0930&resolution=7"
```

```json
{
  "resolution": 7,
  "cell": "872830828ffffff"
}
```

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `lat` | double | ✅ | Enlem (-90 ile 90 arası) |
| `lng` | double | ✅ | Boylam (-180 ile 180 arası) |
| `resolution` | int | ✅ | H3 çözünürlük seviyesi (0-15) |

---

#### `GET` /api/h3/parent/{cell} — Üst Hücre Bulma

```bash
curl "http://localhost:8080/api/h3/parent/872830828ffffff"
```

```json
{
  "cell": "872830828ffffff",
  "parent": "862830827ffffff"
}
```

---

#### `GET` /api/h3/children/{cell} — Alt Hücreleri Listeleme

```bash
curl "http://localhost:8080/api/h3/children/872830828ffffff"
```

```json
{
  "cell": "872830828ffffff",
  "children": ["882830828bfffff", "8828308281fffff", "..."]
}
```

---

#### `GET` /api/h3/convert/{cell}?targetRes={res} — Çözünürlük Dönüştürme

```bash
curl "http://localhost:8080/api/h3/convert/872830828ffffff?targetRes=5"
```

Hedef çözünürlük mevcut çözünürlükten düşükse tek bir üst hücre, yüksekse alt hücre listesi döner.

---

### Geometri İşlemleri

#### `GET` /api/h3/geometry/boundary/{cell} — Hücre Sınır Koordinatları

```bash
curl "http://localhost:8080/api/h3/geometry/boundary/872830828ffffff"
```

```json
{
  "cell": "872830828ffffff",
  "coordinates": [
    {"lat": 41.018, "lng": 29.089},
    {"lat": 41.015, "lng": 29.095},
    "..."
  ]
}
```

---

#### `GET` /api/h3/geometry/metrics/{cell} — Hücre Metrikleri

```bash
curl "http://localhost:8080/api/h3/geometry/metrics/872830828ffffff"
```

```json
{
  "cell": "872830828ffffff",
  "center": {"lat": 41.016, "lng": 29.093},
  "areaM2": 5161293.36,
  "edgeLengthM": 1220.63
}
```

---

#### `POST` /api/h3/geometry/fill/polygon — Poligon ile Alan Doldurma

```bash
curl -X POST http://localhost:8080/api/h3/geometry/fill/polygon \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [
      {"lat": 41.025, "lng": 29.08},
      {"lat": 41.025, "lng": 29.11},
      {"lat": 41.005, "lng": 29.11},
      {"lat": 41.005, "lng": 29.08}
    ],
    "resolution": 7
  }'
```

---

#### `POST` /api/h3/geometry/fill/bbox — Bounding Box ile Alan Doldurma

```bash
curl -X POST http://localhost:8080/api/h3/geometry/fill/bbox \
  -H "Content-Type: application/json" \
  -d '{
    "minLat": 41.005, "minLng": 29.08,
    "maxLat": 41.025, "maxLng": 29.11,
    "resolution": 7
  }'
```

---

#### `POST` /api/h3/geometry/fill/circle — Daire ile Alan Doldurma

```bash
curl -X POST http://localhost:8080/api/h3/geometry/fill/circle \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 41.0166, "lng": 29.0930,
    "radiusInMeters": 1000,
    "resolution": 7
  }'
```

---

### Mekânsal İşlemler

#### `GET` /api/h3/neighbors/{cell} — Komşu Hücreleri Bulma

```bash
curl "http://localhost:8080/api/h3/neighbors/872830828ffffff"
```

```json
{
  "cell": "872830828ffffff",
  "neighbors": ["87283082affffff", "87283082cffffff", "..."]
}
```

---

#### `GET` /api/h3/kring/{cell}?radius={k} — K-Ring Halkası

```bash
curl "http://localhost:8080/api/h3/kring/872830828ffffff?radius=2"
```

Merkez hücrenin etrafındaki `k` yarıçaplı halka içindeki tüm hücreleri döner.

---

#### `POST` /api/h3/distance — Grid Mesafesi Hesaplama

```bash
curl -X POST http://localhost:8080/api/h3/distance \
  -H "Content-Type: application/json" \
  -d '{"cell1": "872830828ffffff", "cell2": "87283082affffff"}'
```

```json
{
  "cell1": "872830828ffffff",
  "cell2": "87283082affffff",
  "distance": 1
}
```

---

## 🖥 Dashboard Arayüzü

Uygulama başlatıldığında `http://localhost:8080` adresinde interaktif bir dashboard sunulur.

### Özellikler

- 🗂 **Sidebar Navigasyonu** — 12 endpoint 3 kategoride gruplandırılmış (Core, Geometri, Mekânsal)
- 📝 **Dinamik Form Oluşturucu** — Her endpoint'e özel input alanları
- 🗺️ **Leaflet.js Harita** — Dark theme CartoDB tile'ları ile H3 hücrelerinin poligon görselleştirmesi
- 📋 **JSON Yanıt Paneli** — Syntax highlighting ile formatlı API yanıtı, durum kodu ve yanıt süresi
- 🔔 **Toast Bildirimleri** — Başarılı/hatalı işlem geri bildirimleri
- 🎨 **Glassmorphism Tasarım** — Modern dark theme, gradient aksan renkleri, smooth animasyonlar

---

## 📁 Proje Yapısı

```
h3-service/
├── src/
│   ├── main/
│   │   ├── java/com/h3_geospatial_core/
│   │   │   ├── H3Application.java              # Spring Boot ana sınıf
│   │   │   ├── config/
│   │   │   │   └── H3Config.java                # H3Core bean konfigürasyonu
│   │   │   ├── controller/
│   │   │   │   ├── H3CoreController.java        # Core endpoint'ler (4 endpoint)
│   │   │   │   ├── H3GeometryController.java    # Geometri endpoint'ler (5 endpoint)
│   │   │   │   └── H3SpatialController.java     # Mekânsal endpoint'ler (3 endpoint)
│   │   │   ├── dto/
│   │   │   │   ├── request/                     # İstek DTO'ları (5 record)
│   │   │   │   │   ├── BoundingBoxRequest.java
│   │   │   │   │   ├── CircleFillRequest.java
│   │   │   │   │   ├── CoordinateDto.java
│   │   │   │   │   ├── DistanceRequest.java
│   │   │   │   │   └── PolygonFillRequest.java
│   │   │   │   └── response/                    # Yanıt DTO'ları (10 record)
│   │   │   │       ├── CellResponse.java
│   │   │   │       ├── CellMetricsResponse.java
│   │   │   │       ├── ChildrenResponse.java
│   │   │   │       ├── ConvertResponse.java
│   │   │   │       ├── DistanceResponse.java
│   │   │   │       ├── FillResponse.java
│   │   │   │       ├── KRingResponse.java
│   │   │   │       ├── NeighborsResponse.java
│   │   │   │       ├── ParentResponse.java
│   │   │   │       └── PolygonResponse.java
│   │   │   └── service/
│   │   │       ├── H3CoreService.java           # Core servis interface
│   │   │       ├── H3GeometryService.java       # Geometri servis interface
│   │   │       ├── H3SpatialService.java        # Mekânsal servis interface
│   │   │       └── Impl/
│   │   │           ├── H3CoreServiceImpl.java    # Core implementasyon
│   │   │           ├── H3GeometryServiceImpl.java# Geometri implementasyon
│   │   │           └── H3SpatialServiceImpl.java # Mekânsal implementasyon
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │           ├── index.html                   # Dashboard HTML
│   │           ├── css/style.css                # Premium dark theme CSS
│   │           └── js/app.js                    # Dashboard mantığı & harita
│   └── test/
├── pom.xml
└── README.md
```

---

## 📐 H3 Çözünürlük Tablosu

| Çözünürlük | Ortalama Alan | Kenar Uzunluğu | Hücre Sayısı (Dünya) |
|:----------:|:-------------:|:--------------:|:--------------------:|
| 0 | 4,357,449 km² | 1,108 km | 122 |
| 1 | 609,788 km² | 419 km | 842 |
| 2 | 86,801 km² | 158 km | 5,882 |
| 3 | 12,393 km² | 59.8 km | 41,162 |
| 4 | 1,770 km² | 22.6 km | 288,122 |
| 5 | 252.9 km² | 8.54 km | 2,016,842 |
| 6 | 36.13 km² | 3.23 km | 14,117,882 |
| 7 | 5.161 km² | 1.22 km | 98,825,162 |
| 8 | 0.737 km² | 461 m | 691,776,122 |
| 9 | 0.105 km² | 174 m | 4,842,432,842 |
| 10 | 15,047 m² | 65.9 m | 33,897,029,882 |
| 11 | 2,149 m² | 24.9 m | 237,279,209,162 |
| 12 | 307.1 m² | 9.42 m | 1,660,954,464,122 |
| 13 | 43.87 m² | 3.56 m | 11,626,681,248,842 |
| 14 | 6.267 m² | 1.35 m | 81,386,768,741,882 |
| 15 | 0.895 m² | 0.51 m | 569,707,381,193,162 |

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında dağıtılmaktadır.

---

<p align="center">
  <sub>⬡ Uber H3 ile güçlendirilmiştir</sub>
</p>

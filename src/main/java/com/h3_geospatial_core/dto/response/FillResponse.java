package com.h3_geospatial_core.dto.response;

import java.util.List;

public record FillResponse(
        String fillType,     // İşlemin tipi (CIRCLE, POLYGON veya BOUNDING_BOX)
        int resolution,      // Hangi çözünürlükte doldurulduğu
        int cellCount,       // Toplam kaç adet altıgen sığdığı (Örn: 154 adet)
        List<String> cells   // H3 indexlerinin listesi
) {}
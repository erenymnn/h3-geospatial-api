package com.h3_geospatial_core.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record CircleFillRequest(
        @Min(value = -90, message = "Enlem -90'dan küçük olamaz")
        @Max(value = 90, message = "Enlem 90'dan büyük olamaz")
        double lat,
        @Min(value = -180, message = "Boylam -180'den küçük olamaz")
        @Max(value = 180, message = "Boylam 180'den büyük olamaz")
        double lng,
        @Min(value = 1, message = "Yarıçap en az 1 metre olmalıdır")
        double radiusInMeters, // Kural Record içinde!
        @Min(value = 0, message = "Resolution en az 0 olabilir")
        @Max(value = 15, message = "Resolution en fazla 15 olabilir")
        int resolution
) {}
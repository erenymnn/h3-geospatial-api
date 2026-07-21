package com.h3_geospatial_core.dto.request;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;
public record PolygonFillRequest(
        @NotNull(message = "Koordinat listesi boş olamaz") List<CoordinateDto> coordinates,
        @Min(0) @Max(15) int resolution
) {}
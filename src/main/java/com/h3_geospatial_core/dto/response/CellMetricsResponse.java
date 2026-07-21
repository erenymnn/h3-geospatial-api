package com.h3_geospatial_core.dto.response;

import com.uber.h3core.util.LatLng;

public record CellMetricsResponse(
        String cell,
        LatLng center,
        double areaSquareMeters,
        double averageEdgeLengthMeters
) {}
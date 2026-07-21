package com.h3_geospatial_core.dto.response;

import com.uber.h3core.util.LatLng;

import java.util.List;

public record PolygonResponse(String cell, List<LatLng> coordinates) {}
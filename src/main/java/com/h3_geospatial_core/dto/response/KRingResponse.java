package com.h3_geospatial_core.dto.response;

import java.util.List;

public record KRingResponse(String cell, int radius, List<String> kRing) {}
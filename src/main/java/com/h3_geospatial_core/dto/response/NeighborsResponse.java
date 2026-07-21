package com.h3_geospatial_core.dto.response;

import java.util.List;

public record NeighborsResponse(String cell, List<String> neighbors) {}
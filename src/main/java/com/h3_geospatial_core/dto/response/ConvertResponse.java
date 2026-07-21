package com.h3_geospatial_core.dto.response;

public record ConvertResponse(String cell, int targetResolution, Object result) {}
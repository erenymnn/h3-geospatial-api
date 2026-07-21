package com.h3_geospatial_core.dto.response;

import java.util.List;

public record ChildrenResponse(String cell, List<String> children) {}
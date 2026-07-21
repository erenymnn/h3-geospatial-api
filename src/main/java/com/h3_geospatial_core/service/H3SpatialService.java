package com.h3_geospatial_core.service;

import java.util.List;

public interface H3SpatialService {
    List<String> getNeighbors(String cellAddress);
    List<String> getKRing(String cellAddress, int radius);
    long getDistance(String cell1, String cell2);
}
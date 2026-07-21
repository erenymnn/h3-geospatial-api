package com.h3_geospatial_core.service;

import java.util.List;

public interface H3CoreService {
    String latLngToCellAddress(double lat, double lng, int res);
    String getParent(String cellAddress);
    List<String> getChildren(String cellAddress);
    Object convertResolution(String cellAddress, int targetResolution);
}
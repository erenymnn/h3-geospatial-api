package com.h3_geospatial_core.service;

import com.uber.h3core.util.LatLng;

import java.util.List;

public interface H3GeometryService {
    List<LatLng> getCellBoundary(String cellAddress);
    LatLng getCellCenter(String cellAddress);
    double getCellArea(String cellAddress);
    double getEdgeLength(String cellAddress);
    List<String> fillPolygon(List<LatLng> polygon, int res);
    List<String> fillBoundingBox(double minLat, double minLng, double maxLat, double maxLng, int res);
    List<String> fillCircle(double lat, double lng, double radiusInMeters, int res);
}
package com.h3_geospatial_core.service.Impl;

import com.h3_geospatial_core.service.H3GeometryService;
import com.uber.h3core.H3Core;
import com.uber.h3core.util.LatLng;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
public class H3GeometryServiceImpl implements H3GeometryService {

    private final H3Core h3;

    @Override
    public List<LatLng> getCellBoundary(String cellAddress) {
        return h3.cellToBoundary(cellAddress);
    }

    @Override
    public LatLng getCellCenter(String cellAddress) {
        return h3.cellToLatLng(cellAddress);
    }

    @Override
    public double getCellArea(String cellAddress) {
        return h3.cellArea(cellAddress, com.uber.h3core.AreaUnit.m2);
    }

    @Override
    public double getEdgeLength(String cellAddress) {
        int res = h3.getResolution(cellAddress);
        return h3.getHexagonEdgeLengthAvg(res, com.uber.h3core.LengthUnit.m);
    }

    @Override
    public List<String> fillPolygon(List<LatLng> polygon, int res) {
        return h3.polygonToCellAddresses(polygon, null, res);
    }

    @Override
    public List<String> fillBoundingBox(double minLat, double minLng, double maxLat, double maxLng, int res) {
        List<LatLng> bboxPolygon = List.of(
                new LatLng(minLat, minLng),
                new LatLng(minLat, maxLng),
                new LatLng(maxLat, maxLng),
                new LatLng(maxLat, minLng)
        );
        return h3.polygonToCellAddresses(bboxPolygon, null, res);
    }

    @Override
    public List<String> fillCircle(double lat, double lng, double radiusInMeters, int res) {
        List<LatLng> circlePolygon = new ArrayList<>();
        double earthRadius = 6371000.0;

        for (int i = 0; i < 32; i++) {
            double angle = 2 * Math.PI * i / 32;
            double dx = radiusInMeters * Math.cos(angle);
            double dy = radiusInMeters * Math.sin(angle);

            double deltaLat = dy / earthRadius;
            double deltaLng = dx / (earthRadius * Math.cos(Math.toRadians(lat)));

            circlePolygon.add(new LatLng(
                    lat + Math.toDegrees(deltaLat),
                    lng + Math.toDegrees(deltaLng)
            ));
        }
        return h3.polygonToCellAddresses(circlePolygon, null, res);
    }
}
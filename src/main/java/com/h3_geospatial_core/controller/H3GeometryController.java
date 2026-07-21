package com.h3_geospatial_core.controller;

import com.h3_geospatial_core.dto.request.BoundingBoxRequest;
import com.h3_geospatial_core.dto.request.CircleFillRequest;
import com.h3_geospatial_core.dto.request.PolygonFillRequest;
import com.h3_geospatial_core.dto.response.CellMetricsResponse;
import com.h3_geospatial_core.dto.response.FillResponse;
import com.h3_geospatial_core.dto.response.PolygonResponse;
import com.h3_geospatial_core.service.H3GeometryService;
import com.uber.h3core.util.LatLng;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/h3/geometry")
@Validated
@RequiredArgsConstructor
public class H3GeometryController {

    private final H3GeometryService h3GeometryService;

    // --- TEMEL GEOMETRİ VE METRİKLER ---

    @GetMapping("/boundary/{cell}")
    public ResponseEntity<PolygonResponse> getBoundary(
            @PathVariable @NotBlank(message = "Hücre adresi boş olamaz") String cell) {
        List<LatLng> coordinates = h3GeometryService.getCellBoundary(cell);
        return ResponseEntity.ok(new PolygonResponse(cell, coordinates));
    }

    @GetMapping("/metrics/{cell}")
    public ResponseEntity<CellMetricsResponse> getCellMetrics(@PathVariable String cell) {
        LatLng center = h3GeometryService.getCellCenter(cell);
        double area = h3GeometryService.getCellArea(cell);
        double edgeLength = h3GeometryService.getEdgeLength(cell);

        return ResponseEntity.ok(new CellMetricsResponse(cell, center, area, edgeLength));
    }

    // --- ALAN DOLDURMA (GEOFENCING) İŞLEMLERİ ---

    @PostMapping("/fill/polygon")
    public ResponseEntity<FillResponse> fillPolygon(@Valid @RequestBody PolygonFillRequest request) {

        // Gelen CoordinateDto listesini H3'ün LatLng listesine dönüştürüyoruz
        List<com.uber.h3core.util.LatLng> h3Coordinates = request.coordinates().stream()
                .map(c -> new com.uber.h3core.util.LatLng(c.lat(), c.lng()))
                .toList();

        // Dönüştürülmüş listeyi servise gönderiyoruz
        List<String> cells = h3GeometryService.fillPolygon(h3Coordinates, request.resolution());

        return ResponseEntity.ok(new FillResponse("POLYGON", request.resolution(), cells.size(), cells));
    }

    @PostMapping("/fill/bbox")
    public ResponseEntity<FillResponse> fillBoundingBox(@Valid @RequestBody BoundingBoxRequest request) {
        List<String> cells = h3GeometryService.fillBoundingBox(
                request.minLat(), request.minLng(), request.maxLat(), request.maxLng(), request.resolution());
        return ResponseEntity.ok(new FillResponse("BOUNDING_BOX", request.resolution(), cells.size(), cells));
    }

    @PostMapping("/fill/circle")
    public ResponseEntity<FillResponse> fillCircle(@Valid @RequestBody CircleFillRequest request) {
        List<String> cells = h3GeometryService.fillCircle(
                request.lat(), request.lng(), request.radiusInMeters(), request.resolution());
        return ResponseEntity.ok(new FillResponse("CIRCLE", request.resolution(), cells.size(), cells));
    }
}
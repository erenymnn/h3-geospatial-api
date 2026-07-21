package com.h3_geospatial_core.controller;

import com.h3_geospatial_core.dto.request.DistanceRequest;
import com.h3_geospatial_core.dto.response.DistanceResponse;
import com.h3_geospatial_core.dto.response.KRingResponse;
import com.h3_geospatial_core.dto.response.NeighborsResponse;
import com.h3_geospatial_core.service.H3SpatialService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/h3")
@Validated
@RequiredArgsConstructor
public class H3SpatialController {

    private final H3SpatialService h3SpatialService;

    @GetMapping("/neighbors/{cell}")
    public ResponseEntity<NeighborsResponse> getNeighbors(
            @PathVariable @NotBlank(message = "Hücre adresi boş olamaz") String cell) {
        return ResponseEntity.ok(new NeighborsResponse(cell, h3SpatialService.getNeighbors(cell)));
    }

    @GetMapping("/kring/{cell}")
    public ResponseEntity<KRingResponse> getKRing(
            @PathVariable @NotBlank(message = "Hücre adresi boş olamaz") String cell,
            @RequestParam @Min(value = 0, message = "Yarıçap 0'dan küçük olamaz") int radius) {
        return ResponseEntity.ok(new KRingResponse(cell, radius, h3SpatialService.getKRing(cell, radius)));
    }

    @PostMapping("/distance")
    public ResponseEntity<DistanceResponse> getDistance(
            @Valid @RequestBody DistanceRequest request) {
        long distance = h3SpatialService.getDistance(request.cell1(), request.cell2());
        return ResponseEntity.ok(new DistanceResponse(request.cell1(), request.cell2(), distance));
    }
}
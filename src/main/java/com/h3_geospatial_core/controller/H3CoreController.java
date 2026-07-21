package com.h3_geospatial_core.controller;

import com.h3_geospatial_core.dto.response.CellResponse;
import com.h3_geospatial_core.dto.response.ChildrenResponse;
import com.h3_geospatial_core.dto.response.ConvertResponse;
import com.h3_geospatial_core.dto.response.ParentResponse;
import com.h3_geospatial_core.service.H3CoreService;
import jakarta.validation.constraints.Max;
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
public class H3CoreController {

    private final H3CoreService h3CoreService;

    @GetMapping("/cell")
    public ResponseEntity<CellResponse> getCell(
            @RequestParam @Min(value = -90, message = "Enlem -90'dan küçük olamaz") @Max(value = 90, message = "Enlem 90'dan büyük olamaz") double lat,
            @RequestParam @Min(value = -180, message = "Boylam -180'den küçük olamaz") @Max(value = 180, message = "Boylam 180'den büyük olamaz") double lng,
            @RequestParam @Min(value = 0, message = "Resolution en az 0 olabilir") @Max(value = 15, message = "Resolution en fazla 15 olabilir") int resolution) {

        String cell = h3CoreService.latLngToCellAddress(lat, lng, resolution);
        return ResponseEntity.ok(new CellResponse(resolution, cell));
    }

    @GetMapping("/parent/{cell}")
    public ResponseEntity<ParentResponse> getParent(
            @PathVariable @NotBlank(message = "Hücre adresi boş olamaz") String cell) {
        return ResponseEntity.ok(new ParentResponse(cell, h3CoreService.getParent(cell)));
    }

    @GetMapping("/children/{cell}")
    public ResponseEntity<ChildrenResponse> getChildren(
            @PathVariable @NotBlank(message = "Hücre adresi boş olamaz") String cell) {
        return ResponseEntity.ok(new ChildrenResponse(cell, h3CoreService.getChildren(cell)));
    }

    @GetMapping("/convert/{cell}")
    public ResponseEntity<ConvertResponse> convertResolution(
            @PathVariable @NotBlank(message = "Hücre adresi boş olamaz") String cell,
            @RequestParam @Min(0) @Max(15) int targetRes) {
        return ResponseEntity.ok(new ConvertResponse(cell, targetRes, h3CoreService.convertResolution(cell, targetRes)));
    }
}
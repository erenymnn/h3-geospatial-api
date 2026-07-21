package com.h3_geospatial_core.service.Impl;

import com.h3_geospatial_core.service.H3CoreService;
import com.uber.h3core.H3Core;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class H3CoreServiceImpl implements H3CoreService {

    private final H3Core h3;

    @Override
    public String latLngToCellAddress(double lat, double lng, int res) {
        return h3.latLngToCellAddress(lat, lng, res);
    }

    @Override
    public String getParent(String cellAddress) {
        int res = h3.getResolution(cellAddress);
        if (res == 0) return null;
        return h3.cellToParentAddress(cellAddress, res - 1);
    }

    @Override
    public List<String> getChildren(String cellAddress) {
        int res = h3.getResolution(cellAddress);
        if (res == 15) return null;
        return h3.cellToChildren(cellAddress, res + 1);
    }

    @Override
    public Object convertResolution(String cellAddress, int targetResolution) {
        int currentRes = h3.getResolution(cellAddress);
        if (targetResolution == currentRes) {
            return List.of(cellAddress);
        } else if (targetResolution < currentRes) {
            return h3.cellToParentAddress(cellAddress, targetResolution);
        } else {
            return h3.cellToChildren(cellAddress, targetResolution);
        }
    }
}
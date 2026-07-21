package com.h3_geospatial_core.service.Impl;

import com.h3_geospatial_core.service.H3SpatialService;
import com.uber.h3core.H3Core;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class H3SpatialServiceImpl implements H3SpatialService {

    private final H3Core h3;

    @Override
    public List<String> getNeighbors(String cellAddress) {
        List<String> disk = h3.gridDisk(cellAddress, 1);
        return disk.stream().filter(c -> !c.equals(cellAddress)).collect(Collectors.toList());
    }

    @Override
    public List<String> getKRing(String cellAddress, int radius) {
        return h3.gridDisk(cellAddress, radius);
    }

    @Override
    public long getDistance(String cell1, String cell2) {
        return h3.gridDistance(cell1, cell2);
    }
}
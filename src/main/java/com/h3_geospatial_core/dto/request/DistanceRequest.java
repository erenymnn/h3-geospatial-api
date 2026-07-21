package com.h3_geospatial_core.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DistanceRequest(
        @NotBlank(message = "1. Hücre adresi boş olamaz")
        @Size(min = 15, max = 15, message = "Geçerli bir H3 indexi 15 karakter olmalıdır")
        String cell1,

        @NotBlank(message = "2. Hücre adresi boş olamaz")
        @Size(min = 15, max = 15, message = "Geçerli bir H3 indexi 15 karakter olmalıdır")
        String cell2
) {}
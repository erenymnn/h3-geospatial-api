package com.h3_geospatial_core.config;

import com.uber.h3core.H3Core;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class H3Config {

    @Bean
    public H3Core h3Core() throws IOException {
        // H3Core nesnesi uygulama ayağa kalkarken 1 kez üretilir
        // ve isteyen tüm servislere (Singleton olarak) dağıtılır.
        return H3Core.newInstance();
    }
}
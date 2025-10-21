package com.aledhemtek.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class TaskManagementRequest {
    private List<Long> taskIds;
    private Map<String, Integer> taskQuantities;
}

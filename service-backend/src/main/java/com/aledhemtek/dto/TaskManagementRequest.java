package com.aledhemtek.dto;
 
import lombok.Data;
import java.util.List;
import java.util.Map;
 
@Data
public class TaskManagementRequest {
    private List<Long> taskIds;
    private Map<String, Integer> taskQuantities;

    public TaskManagementRequest() {}

    public TaskManagementRequest(List<Long> taskIds, Map<String, Integer> taskQuantities) {
        this.taskIds = taskIds;
        this.taskQuantities = taskQuantities;
    }

    public List<Long> getTaskIds() { return taskIds; }
    public void setTaskIds(List<Long> taskIds) { this.taskIds = taskIds; }

    public Map<String, Integer> getTaskQuantities() { return taskQuantities; }
    public void setTaskQuantities(Map<String, Integer> taskQuantities) { this.taskQuantities = taskQuantities; }
}

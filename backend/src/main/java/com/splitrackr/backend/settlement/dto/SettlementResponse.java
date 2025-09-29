package com.splitrackr.backend.settlement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SettlementResponse {
    private Integer settlementId;
    private Integer householdId;
    private String status;
    private Instant periodStart;
    private Instant periodEnd;
    private Instant createdAt;
    private UserDto createdBy;
    private Instant asOf;
    private List<TransferDto> transfers;
    private List<UserBalanceDto> balances;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransferDto {
        private Integer fromUserId;
        private Integer toUserId;
        private Integer amountCents;
        private String fromUserName;
        private String toUserName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserBalanceDto {
        private Integer userId;
        private String userName;
        private Integer netCents;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private Integer id;
        private String email;
        private String firstName;
        private String lastName;
    }
}

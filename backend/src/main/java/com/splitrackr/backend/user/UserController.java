package com.splitrackr.backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser (Authentication authentication) {
        //var email = (String) authentication.getPrincipal();
        var email = authentication.getName();
        var user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(user);
    }

}

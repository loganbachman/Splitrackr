package com.splitrackr.backend.user;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// repo interacts w/ database
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // find users by email
    Optional<User> findByEmail(String email);
}

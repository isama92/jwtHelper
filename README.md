# JwtHelper
Small class to manage the jwt auth token and its refresh in localStorage.

## Recommendations
Avoid saving jwt auth token in localStorage if you can, it is better to save only the refresh token, possibly as httpOnly cookie.

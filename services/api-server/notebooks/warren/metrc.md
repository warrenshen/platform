## Transfer packages

Returned -> Accepted
A package may be returned in transfer A and then may be accepted in transfer B, where transfer B happens after transfer A. The values of the package in transfer A may be different than the values of the package in transfer B.


Returned -> Returned
A package may be returned in transfer A and then may be returned again in transfer B, where transfer B happens after transfer A.

## Packages
Packages quantity may be greater than 0 even though sales transactions indicate quantity is 0.

## Calculate inventory based on transfer packages and sales transactions
1. Packages-based inventory may have packages with non-zero quantity even though calculated-inventory contains same packages with zero quantity.
2. An inactive package will have either of "archived date" or "finished date" set. The date set on either of these two fields is the date that the package is considered to be moved out of active inventory.

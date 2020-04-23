#!/bin/bash

FILES="cyberhawk.js controller.js notifier.js requester.js delegator.js function_wrapper.js"

echo "" > cyberhawk.js

for FILE in $FILES; do
  cat "src/$FILE" >> cyberhawk.js
  echo "" >> cyberhawk.js
done

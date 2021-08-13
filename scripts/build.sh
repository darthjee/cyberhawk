#!/bin/bash

FILES="delegator.js function_wrapper.js cyberhawk.js paginator.js pagination.js "
FILES=$FILES"controller.js notifier.js binded_http.js requester.js"

echo "" > cyberhawk.js

for FILE in $FILES; do
  echo "// $FILE" >> cyberhawk.js
  cat "src/$FILE" >> cyberhawk.js
  echo "" >> cyberhawk.js
done

#!/bin/bash

FILES="delegator.js function_wrapper.js cyberhawk.js underscore_ext.js"
FILES=$FILES" paginator.js pagination.js"
FILES=$FILES" hooks_methods.js extension_methods.js controller_methods.js"
FILES=$FILES" controller.js notifier.js binded_http.js requester.js"
FILES=$FILES" filters/dig.js filters/percentage.js filters/select_options.js"
FILES=$FILES" filters/string.js filters/number.js"
FILES=$FILES" config.js"
FILES=$FILES" controller_builder.js"

cp template/header.js cyberhawk.js

for FILE in $FILES; do
  echo "// $FILE" >> cyberhawk.js
  cat "src/$FILE" >> cyberhawk.js
  echo "" >> cyberhawk.js
done

cat template/footer.js >> cyberhawk.js

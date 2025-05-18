#!/bin/bash

FILES="delegator.js function_wrapper.js cyberhawk.js underscore_ext.js"
FILES=$FILES" paginator.js pagination.js"
FILES=$FILES" hooks_methods.js extension_methods.js controller_methods.js"
FILES=$FILES" controller.js notifier.js binded_http.js requester.js"
FILES=$FILES" filters/dig.js filters/percentage.js filters/select_options.js"
FILES=$FILES" filters/string.js filters/number.js"
FILES=$FILES" config.js"
FILES=$FILES" controller_builder.js"
FILES=$FILES" global_state.js"

cp template/header.js tmp_building.js

for FILE in $FILES; do
  echo "// $FILE" >> tmp_building.js
  cat "src/$FILE" >> tmp_building.js
  echo "" >> tmp_building.js
done

cat template/footer.js >> tmp_building.js
mv tmp_building.js cyberhawk.js

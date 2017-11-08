"use strict";

/* exported Section */

function Section(header, ...content) {
  return createElement("section", {className: "card"},
    createElement("h1", {}, header),
    ...content
  );
}

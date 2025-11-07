# @opendoc/uri-template

## Usage

```typescript
import { UriTemplate } from "@opendoc/uri-template";

const uriTemplate = new UriTemplate("/api/users/{id}");

uriTemplate.extend({ id: 1 }); // api/users/1
```

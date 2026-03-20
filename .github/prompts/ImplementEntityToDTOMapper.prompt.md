---
name: ImplementEntityToDTOMapper
description: This prompt is used to implement an entity or object value in the project. Use it when the user asks you to integrate one of this domains objects into the project.
---

# Implemeting Entity or Object value within the project.
### What the user is going to give you?
- Name of the entity or object value.
- DTO that of the entity or object value.

If user didn't provide this, ABORT IT. DON'T CONTINUE WITH THE PROMPT.
Otherwise, continue with the prompt.

#### Steps to implement an entity or object value
1. Locate the file that user is referring to, this can be in one of this folders:
- src/core/entities
- src/core/object-values

Then, locate the DTO version of the user:
- src/application/commands

Scan this files to know what fields they have.

2. Once you have scanned the entity or the object value and DTO. Implement its guards.
Each domain object must have two guards, one to ensure the it is the DTO and the other one to ensure the domain object.

The guard that ensures it is a DTO has to be located in:
- src/application/dtoGuards.ts

The guard that ensures it is a domain object has to be located in:
- src/application/entityGuards.ts

Implement the guards for each case in the respective files.

> When implementing the guards, the validation has to be using each field, in this way, we avoid collisions with futures dtos and domain entities.

3. Once the guards has been implemented. Implement the methods in the mapper.
- First implement the method for trasnforming from entity to dto.
- Then, implement the methods for trasnforming from dto to entity.
- Once the methods has been created. In `toEntity` method use the dto guard to redirect to the transforming method to transform from dto to entity.
- Once the methods has been created. In `toDTO` method use the entity guard to redirect to the transforming method to transform from entity to dto.

---
name: ImplementNewUIComponent
description: Use this component when the user asks you to implement a new UI component. This component can be a page, a form, a button, etc. The user will provide you with the name of the component, its purpose, and any specific requirements or design guidelines that need to be followed.
---

<!-- Tip: Use /create-prompt in chat to generate content with agent assistance -->

# Implementing a new UI component
### What the user is going to give you?
- Name of the component.
- File where it will be implemented.
- DTOs used in that component.
- Image of how the component should look like.

If user didn't provide this, ABORT IT. DON'T CONTINUE WITH THE PROMPT.
Otherwise, continue with the prompt.

### What you need to do?
1. Analyze the provided information and understand the requirements for the new UI component.
2. Analyze the image provided by the user to understand the design and layout of the component.
3. Analyze the dto provided by the user to understand the data structure that the component will use.
  - You will find the dtos in "src/application/dtos" folder.
4. Implement the new UI component in the specified file, following the design guidelines and using the provided DTOs.

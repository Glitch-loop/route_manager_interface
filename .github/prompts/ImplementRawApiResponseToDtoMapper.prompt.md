---
name: Register a transformation in the mapper.
description: This prompt is used when the user wants to register a transformation in the mapper.
---

This prompt is used when the user wants to register a transformation in the mapper. 
There are 2 types of transformations:
- From raw api response to dto.
- From dto to raw api response.

# Input:
User will provide you with the following information:
- Module that belongs the mapper.
- The type of transformation they want to register.
- The raw api respone or dto that they want to transform from.
- The raw api respone or dto that they want to transform to.

> Remember the schema will be used in a typescript application. So you have to define the schema in typescript.

# Steps to follow:
* Find the domain object/dto/model that the user refers
  - raw api response `@/src/shared/raw-api-response`.
  - dto `@/src/shared/dto`.
* Find the guard that validates the object the users wants to transform, this will help you to understand the schema of domain object/dto/model that you are going to transform.
  - guards for raw api response `@/src/shared/guards`.
  - guards for dtos `@/src/shared/guards`.
* Once you have identified the artifact(s) implied and its respective guards, you have to 
understand the schema/model/interface you are going to transform, it's relevant a deep 
understanding because you have to use all the fields that compound the schema to make the 
transformation.
* Once you have identified what you are going to do, you have to locate transformation in this 
file:
  -`@/src/shared/mappers/rawApiResponseToDTOMapper.ts`.

# The following example is from another project but the logic behaind the steps remain the same.

* To register the transformation correctly, firstly, you have to split the process in two steps:
  1. Create the method that actually makes the converstion and locate the function in the correct section:
  - In the case of `@/src/<module>/application/mappers/entity-model.mapper.ts`
  Sections:
    ```typescript
    // ==================== MAPPER METHODS DOMAIN OBJECT to MODEL ====================
    /*All funcitons that transform from domain objects to model*/
    // ==================== MAPPER METHODS MODEL to DOMAIN OBJECT ====================
    /*All funcitons that transform from model to domain objects*/
    ```

  - In the case of `@/src/<module>/application/mappers/entity-dto.mapper.ts`
  Sections:
    ```typescript
    // ==================== MAPPER METHODS DOMAIN OBJECT to DTO ====================
    /*All funcitons that transform from domain objects to dto*/
    // ==================== MAPPER METHODS DTO to DOMAIN OBJECT ====================
    /*All funcitons that transform from dto to domain objects*/
    ```
  
  2. Register the method in the overloaded functions.
  - In the case of `@/src/<module>/application/mappers/entity-model.mapper.ts`
  There are 2 overloaded functions:
    1. toDomainObject: This function transforms from model to domain object, so if your transformation is from model to domain object you have to register the transformation in this function.
      Example:
        ```typescript
          toDomainObject(model: ClientModel): TaxClientInformationEntity;
          toDomainObject(model: LocationModel, locationTypeModel: LocationTypeModel, locationNotesModel: LocationNoteModel[]): LocationEntity;
          toDomainObject(model: LocationModel | ClientModel, locationTypeModel?: LocationTypeModel, locationNotesModel?: LocationNoteModel[]): any { ... }
        ```

    2. toModel: This function transforms from domain object to model, so if your transformation is from domain object to model you have to register the transformation in this function.
      Example:
        ```typescript
          toModel(domainObject: TaxClientInformationEntity): ClientModel;
          toModel(domainObject: LocationEntity): LocationModel;
          toModel(domainObject: NoteObjectValue, parentDomainObject: LocationEntity): LocationModel;
          toModel(domainObject: LocationTypeObjectValue): LocationTypeModel;
          toModel(domainObject: TaxClientInformationEntity | LocationEntity | NoteObjectValue | LocationTypeObjectValue, parentDomainObject?: LocationEntity): any { ... }
        ```
  
  - In the case of `@/src/<module>/application/mappers/entity-dto.mapper.ts`
    1. toDomainObject: This function transforms from dto to domain object, so if your transformation is from dto to domain object you have to register the transformation in this function.
    ```typescript
      toDomainObject(dto: LocationDto): LocationEntity;
      toDomainObject(dto: LocationDto): any { ... }
    ```
    2. toModel: This function transforms from domain object to dto, so if your transformation is from domain object to dto you have to register the transformation in this function.
    ```typescript
      toDto(domainObject: LocationEntity): LocationDto;
      toDto(domainObject: LocationEntity): any { ... }
    ```

# Example:
Here is an example of how the transformation should be registered in the `mapper.ts` file:
```typescript
 
// Libraries
import { Injectable } from '@nestjs/common';

// Enums
import { LOCATION_STATUS_ENUM } from '@/src/clients/core/enums/client-status.enum';

// Dtos

// Entities
import { LocationEntity } from '@/src/clients/core/entities/location.entity';
import { TaxClientInformationEntity } from '@/src/clients/core/entities/tax-client-information.entity';

// Object values
import { NoteObjectValue } from '@/src/core/object-values/note.object-value';
import { LocationTypeObjectValue } from '@/src/core/object-values/location-type.object-value';

// Models
import { LocationModel } from '@/src/clients/application/models/location.model';
import { ClientModel } from '@/src/clients/application/models/client.model';
import { LocationTypeModel } from '@/src/clients/application/models/location-type.model';
import { LocationNoteModel } from '@/src/clients/application/models/location-note.model';

// Dtos guards

// Entities guards
import { isLocationEntity } from '@/src/clients/application/guards/entities/location.guard';
import { isTaxClientInformationEntity } from '@/src/clients/application/guards/entities/tax-client-information.guard';
import { isNoteObjectValue } from '@/src/application/guards/object-values/note.guard';

// Models guards
import { isLocationModel } from '@/src/clients/application/guards/models/location.guard';
import { isClientModel } from '@/src/clients/application/guards/models/client.guard';
import { isLocationTypeModel } from '@/src/clients/application/guards/models/location-type.guard';
import { isLocationNoteModel } from '@/src/clients/application/guards/models/location-note.guard';
import { isLocationTypeObjectValue } from '@/src/application/guards/object-values/location-type.guard';

@Injectable()
export class Mapper {
  constructor() {}

  // ==================== OVERLOADED FUNCTIONS FOR MAPPING ====================
  // toDomainObject overloads
  toDomainObject(model: ClientModel): TaxClientInformationEntity;
  toDomainObject(model: LocationModel, locationTypeModel: LocationTypeModel, locationNotesModel: LocationNoteModel[]): LocationEntity;
  toDomainObject(model: LocationModel | ClientModel, locationTypeModel?: LocationTypeModel, locationNotesModel?: LocationNoteModel[]): any {
    if (isClientModel(model)) {
      return this.clientModelToDomainObject(model);
    }
    if (isLocationModel(model)) {
      if (isLocationTypeModel(locationTypeModel) && Array.isArray(locationNotesModel) && locationNotesModel.every(isLocationNoteModel)) { 
        return this.locationModelToDomainObject(model, locationTypeModel, locationNotesModel);
      }
    }
    throw new Error('Invalid input for mapping to domain object');
  }

  // toModel overloads
  toModel(domainObject: TaxClientInformationEntity): ClientModel;
  toModel(domainObject: LocationEntity): LocationModel;
  toModel(domainObject: NoteObjectValue, parentDomainObject: LocationEntity): LocationModel;
  toModel(domainObject: LocationTypeObjectValue): LocationTypeModel;
  toModel(domainObject: TaxClientInformationEntity | LocationEntity | NoteObjectValue | LocationTypeObjectValue, parentDomainObject?: LocationEntity): any
  {
    if (isTaxClientInformationEntity(domainObject)) {
      return this.taxClientInformationEntityToModel(domainObject);
    }
    if (isLocationEntity(domainObject)) {
      return this.locationDomainObjectToModel(domainObject);
    }
    if(isNoteObjectValue(domainObject) && isLocationEntity(parentDomainObject)) {
      return this.noteDomainObjectToModel(domainObject, parentDomainObject);      
    }
    if(isLocationTypeObjectValue(domainObject)) {
      return this.locationTypeDomainObjectToModel(domainObject);
    }

    throw new Error('Invalid input for mapping to model');
  
  }
  
  // ==================== MAPPER METHODS DOMAIN OBJECT to MODEL ====================
  private taxClientInformationEntityToModel(domainObject: TaxClientInformationEntity): ClientModel {
    return {
      id_client: domainObject.id_client,
      legal_name: domainObject.legal_name,
      postal_code: domainObject.postal_code,
      fiscal_regime: domainObject.fiscal_regime,
      name: domainObject.name,
      cellphone: domainObject.cellphone,
      email: domainObject.email,
      created_at: domainObject.created_at,
      updated_at: domainObject.updated_at,
    };
  }

  private locationDomainObjectToModel(domainObject: LocationEntity): LocationModel {
    return {
      id_location: domainObject.id_location,
      street: domainObject.street,
      ext_number: domainObject.ext_number,
      colony: domainObject.colony,
      postal_code: domainObject.postal_code,
      address_reference: domainObject.address_reference || undefined,
      location_name: domainObject.location_name,
      latitude: domainObject.latitude,
      longitude: domainObject.longitude,
      status_location: domainObject.status_location,
      id_creator: domainObject.id_creator,
      id_client: domainObject.id_client,
      created_at: domainObject.created_at,
      updated_at: domainObject.updated_at,
    } as LocationModel;
  }

  private noteDomainObjectToModel(domainObject: NoteObjectValue, parentDomainObject: LocationEntity): LocationNoteModel {
    return {
      id_location_note: domainObject.id_note,
      note: domainObject.note,
      id_location: parentDomainObject.id_location,
      created_at: domainObject.created_at,
    } as LocationNoteModel;
  }

  private locationTypeDomainObjectToModel(domainObject: LocationTypeObjectValue): LocationTypeModel {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return {
      id_location_type: domainObject.id_location_type,
      location_type_name: domainObject.location_type_name,
      created_at: domainObject.created_at,
    } as LocationTypeModel;
  }


  // ==================== MAPPER METHODS MODEL to DOMAIN OBJECT ====================
  private clientModelToDomainObject(model: ClientModel): TaxClientInformationEntity {
    if (typeof model.created_at === 'string' && isNaN(Date.parse(model.created_at))) {
      throw new Error('Invalid created_at format in ClientModel');
    }
    if (typeof model.updated_at === 'string' && isNaN(Date.parse(model.updated_at))) {
      throw new Error('Invalid updated_at format in ClientModel');
    }

    return new TaxClientInformationEntity(
      model.id_client,
      model.legal_name,
      model.postal_code,
      model.fiscal_regime,
      model.name,
      model.cellphone,
      model.email,
      new Date(model.created_at),
      new Date(model.updated_at),
    );
  }

  private locationModelToDomainObject(model: LocationModel, locationTypeModel: LocationTypeModel, locationNotesModel: LocationNoteModel[]): LocationEntity {
    if (typeof model.created_at === 'string' && isNaN(Date.parse(model.created_at))) {
      throw new Error('Invalid created_at format in LocationModel');
    }
    if (typeof model.updated_at === 'string' && isNaN(Date.parse(model.updated_at))) {
        throw new Error('Invalid updated_at format in LocationModel');
    }

    if (model.status_location in LOCATION_STATUS_ENUM === false) {
      throw new Error('Invalid status_location in LocationModel');
    }

    return new LocationEntity(
      model.id_location,
      model.street,
      model.ext_number,
      model.colony,
      model.postal_code,
      model.location_name,
      model.latitude,
      model.longitude,
      model.status_location,
      model.id_creator,
      model.id_client,
      new Date(model.created_at),
      new Date(model.updated_at),
      this.locationTypeModelToDomainObject(locationTypeModel),
      locationNotesModel.map(note => this.locationNoteModelToDomainObject(note)),
      model.address_reference || null,
    );
  }

  private locationTypeModelToDomainObject(model: LocationTypeModel): LocationTypeObjectValue {
    if (typeof model.created_at === 'string' && isNaN(Date.parse(model.created_at))) {
      throw new Error('Invalid created_at format in LocationTypeModel');
    }

    return new LocationTypeObjectValue(
      model.id_location_type,
      model.location_type_name,
      new Date(model.created_at)
    );
  }

  private locationNoteModelToDomainObject(model: LocationNoteModel): NoteObjectValue {
    if (typeof model.created_at === 'string' && isNaN(Date.parse(model.created_at))) {
      throw new Error('Invalid created_at format in LocationNoteModel');
    }

    return new NoteObjectValue(
      model.id_location_note,
      model.note,
      model.id_location,
      new Date(model.created_at)
    );
  }
}

```

> As you might notice, if the schema is composed, i.e an entity is composed by an object value this is handled as a separate transformation, declaring the function that makes the convertion (Step 1) and then declare it in the overloaded function (step 2) dependeding the case.

> In the same way, notice that it is used guards to validate and redirect the transformation to the correct function.

import { beforeEach, describe, expect, it } from '@jest/globals';

import { Mapper } from '@/src/application/mappers/mapper';
import { LOCATION_STATUS_ENUM } from '@/src/core/enums/client-status.enum';
import { DayEntity } from '@/src/core/entities/day.entity';
import { TaxClientInformationEntity } from '@/src/core/entities/tax-client-information.entity';
import { LocationEntity } from '@/src/core/entities/location.entity';
import { LocationTypeObjectValue } from '@/src/core/object-values/location-type.object-value';
import { NoteObjectValue } from '@/src/core/object-values/note.object-value';

describe('Mapper.toDomainObject', () => {
  let mapper: Mapper;

  beforeEach(() => {
    mapper = new Mapper();
  });

  it('maps DayModel to DayEntity', () => {
    const model = {
      id_day: 'day-1',
      day_name: 'Tuesday',
      order_to_show: 2,
    };

    const result = mapper.toDomainObject(model);

    expect(result).toBeInstanceOf(DayEntity);
    expect(result).toEqual(new DayEntity('Tuesday', 'day-1', 2));
  });

  it('maps ClientModel to TaxClientInformationEntity', () => {
    const createdAt = new Date('2026-02-10T00:00:00.000Z');
    const updatedAt = new Date('2026-02-11T00:00:00.000Z');
    const model = {
      id_client: 'client-1',
      legal_name: 'Legal Name SA de CV',
      postal_code: '64000',
      fiscal_regime: '601',
      name: 'Jane Doe',
      cellphone: '8181818181',
      email: 'jane@example.com',
      created_at: createdAt,
      updated_at: updatedAt,
    };

    const result = mapper.toDomainObject(model);

    expect(result).toBeInstanceOf(TaxClientInformationEntity);
    expect(result).toEqual(
      new TaxClientInformationEntity(
        'client-1',
        'Legal Name SA de CV',
        '64000',
        '601',
        'Jane Doe',
        '8181818181',
        'jane@example.com',
        createdAt,
        updatedAt,
      ),
    );
  });

  it('maps LocationModel + LocationTypeModel + LocationNoteModel[] to LocationEntity', () => {
    const locationCreatedAt = new Date('2026-03-01T00:00:00.000Z');
    const locationUpdatedAt = new Date('2026-03-02T00:00:00.000Z');
    const locationTypeCreatedAt = new Date('2026-03-03T00:00:00.000Z');
    const noteCreatedAt = new Date('2026-03-04T00:00:00.000Z');

    const locationModel = {
      id_location: 'location-1',
      street: 'Main St',
      ext_number: '123',
      colony: 'Downtown',
      postal_code: '64000',
      address_reference: 'Near the park',
      location_name: 'Store A',
      latitude: '25.68',
      longitude: '-100.31',
      status_location: LOCATION_STATUS_ENUM.CLIENT,
      id_creator: 'creator-1',
      id_client: 'client-1',
      id_location_type: 'type-1',
      created_at: locationCreatedAt,
      updated_at: locationUpdatedAt,
    };

    const locationTypeModel = {
      id_location_type: 'type-1',
      location_type_name: 'Grocery',
      created_at: locationTypeCreatedAt,
    };

    const locationNotesModel = [
      {
        id_location_note: 'note-1',
        note: 'Leave order at back door',
        id_location: 'location-1',
        created_at: noteCreatedAt,
      },
    ];

    const result = mapper.toDomainObject(
      locationModel,
      locationTypeModel,
      locationNotesModel,
    );

    expect(result).toBeInstanceOf(LocationEntity);
    expect(result).toEqual(
      new LocationEntity(
        'location-1',
        'Main St',
        '123',
        'Downtown',
        '64000',
        'Store A',
        '25.68',
        '-100.31',
        LOCATION_STATUS_ENUM.CLIENT,
        'creator-1',
        'client-1',
        locationCreatedAt,
        locationUpdatedAt,
        new LocationTypeObjectValue('type-1', 'Grocery', locationTypeCreatedAt),
        [
          new NoteObjectValue(
            'note-1',
            'Leave order at back door',
            'location-1',
            noteCreatedAt,
          ),
        ],
        'Near the park',
      ),
    );
  });
});

```
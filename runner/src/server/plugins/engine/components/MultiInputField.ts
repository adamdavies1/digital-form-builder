import { InputFieldsComponentsDef } from "@xgovformbuilder/model";
import { optionalText } from "./constants";
import { FormComponent } from "./FormComponent";
import { ComponentCollection } from "./ComponentCollection";
import {
  FormData,
  FormPayload,
  FormSubmissionErrors,
  FormSubmissionState,
} from "../types";
import { FormModel } from "../models";
import { Schema } from "joi";

export class MultiInputField extends FormComponent {
  children: ComponentCollection;

  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);

    this.children = new ComponentCollection(
      [
        {
          type: "TextField",
          name: "type-of-revenue-cost",
          title: "Type of Revenue Cost",
          schema: {},
          options: {},
        },
        {
          type: "TextField",
          name: "revenue-cost",
          title: "Revenue Cost",
          schema: {},
          options: {
            required: false,
          },
        },
      ] as any,
      model
    );
  }

  getFormSchemaKeys() {
    return this.children.getFormSchemaKeys();
  }

  getStateSchemaKeys() {
    return {
      [this.name]: this.children.getStateSchemaKeys() as Schema,
    };
  }

  getFormDataFromState(state: FormSubmissionState) {
    return this.children.getFormDataFromState(state);
  }

  getStateValueFromValidForm(payload: FormPayload) {
    return this.children.getStateFromValidForm(payload);
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const values = state[this.name];
    const stringValue = new Array();
    for (var value of values) {
      stringValue.push(
        `${value["type-of-revenue-cost"]} : ${value["revenue-cost"]}`
      );
    }

    return stringValue;
  }

  // @ts-ignore - eslint does not report this as an error, only tsc
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);

    // Use the component collection to generate the subitems
    const componentViewModels = this.children
      .getViewModel(formData, errors)
      .map((vm) => vm.model);

    componentViewModels.forEach((componentViewModel) => {
      // Nunjucks macro expects label to be a string for this component
      componentViewModel.label = componentViewModel.label?.text?.replace(
        optionalText,
        ""
      ) as any;

      if (componentViewModel.errorMessage) {
        componentViewModel.classes += " govuk-input--error";
      }
    });

    return {
      ...viewModel,
      fieldset: {
        legend: viewModel.label,
      },
      items: componentViewModels,
    };
  }
}

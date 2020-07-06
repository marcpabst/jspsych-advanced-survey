/**
 * jspsych-advanced-survey
 * a jspsych plugin for survey questions
 *
 */

jsPsych.plugins['advanced-survey'] = (function () {
    var plugin = {};
  
    plugin.info = {
      name: 'advanced-survey',
      description: '',
      parameters: {
        questions: {
          type: jsPsych.plugins.parameterType.COMPLEX,
          array: true,
          pretty_name: 'Questions',
          nested: {
            type: {
              type: jsPsych.plugins.parameterType.STRING,
              pretty_name: 'Type',
              default: undefined,
              description: 'The type of the particular question. Can be input, text, multiline, numceric, select, multi or dropdown.'
            },
            prompt: {
              type: jsPsych.plugins.parameterType.STRING,
              pretty_name: 'Prompt',
              default: undefined,
              description: 'The strings that will be associated with a group of options.'
            },
            options: {
              type: jsPsych.plugins.parameterType.STRING,
              pretty_name: 'Options',
              array: true,
              default: "",
              description: 'Displays options for an individual question. Will be ignored if type is not select, multi or dropdown.'
            },
            required: {
              type: jsPsych.plugins.parameterType.BOOL,
              pretty_name: 'Required',
              default: false,
              description: 'Subject will be required to enter information or select an option.'
            },
            name: {
              type: jsPsych.plugins.parameterType.STRING,
              pretty_name: 'Question Name',
              default: '',
              description: 'Controls the name of data values associated with this question'
            },
            placeholder: {
              type: jsPsych.plugins.parameterType.STRING,
              pretty_name: 'Placeholder',
              default: 'Please select or enter an answer',
              description: 'Defines a placeholder text for dropdown and input types.'
            },
            pattern: {
              type: jsPsych.plugins.parameterType.STRING,
              pretty_name: 'Pattern',
              default: '.*',
              description: 'Defines a regular expression used for validation int ext types..'
            },
            attributes: {
              type: jsPsych.plugins.parameterType.STRING,
              pretty_name: 'Question Attributes',
              default: '',
              description: 'Allows to specify additional attributes for input elements. Support might differ between browser.'
            }
          }
        },
        randomize_question_order: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: 'Randomize Question Order',
          default: false,
          description: 'If true, the order of the questions will be randomized'
        },
        preamble: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Preamble',
          default: null,
          description: 'HTML formatted string to display at the top of the page above all the questions.'
        },
        button_label: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Button label',
          default: 'Continue',
          description: 'Label of the button.'
        },
        required_message: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Required message',
          default: 'You must choose at least one response for this question',
          description: 'Message that will be displayed if required question is not answered.'
        }
      }
    }
    plugin.trial = function (display_element, trial) {
      var plugin_id_name = "jspsych-advanced-survey";
      var plugin_id_selector = '#' + plugin_id_name;
      var _join = function ( /*args*/) {
        var arr = Array.prototype.slice.call(arguments, _join.length);
        return arr.join(separator = '-');
      }
  
      // inject CSS for trial
      var cssstr = ".jspsych-advanced-survey-question { margin-top: 2em; margin-bottom: 2em; text-align: left;}" +
        ".jspsych-advanced-survey-prompt { font-weight: bold; }" +
        ".jspsych-advanced-survey-text span.required {color: darkred;}" +
        ".jspsych-advanced-survey-horizontal .jspsych-survey-multi-select-text {  text-align: center;}" +
        ".jspsych-advanced-survey-option { line-height: 2; }" +
        ".jspsych-advanced-survey-horizontal .jspsych-survey-multi-select-option {  display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top;}" +
        "textarea { width: 100%;  height: 50px; resize: none; }" + 
        "label.jspsych-advanced-survey-text input {margin-right: 1em;}"
      display_element.innerHTML = '<style id="jspsych-advanced-survey-css">' + cssstr + '</style>';
  
      // form element
      var trial_form_id = _join(plugin_id_name, "form");
      display_element.innerHTML += '<form id="' + trial_form_id + '"></form>';
      var trial_form = display_element.querySelector("#" + trial_form_id);
  
      // show preamble text
      var preamble_id_name = _join(plugin_id_name, 'preamble');
      if (trial.preamble !== null) {
        trial_form.innerHTML += '<div id="' + preamble_id_name + '" class="' + preamble_id_name + '">' + trial.preamble + '</div>';
      }
  
      // generate question order. this is randomized here as opposed to randomizing the order of trial.questions
      // so that the data are always associated with the same question regardless of order
      var question_order = [];
      for (var i = 0; i < trial.questions.length; i++) {
        question_order.push(i);
      }
      if (trial.randomize_question_order) {
        question_order = jsPsych.randomization.shuffle(question_order);
      }
  
      for (var i = 0; i < trial.questions.length; i++) {
  
        var question = trial.questions[question_order[i]];
        var type = question.type
        var question_id = question_order[i];
  
        // create question container
        trial_form.innerHTML += '<div id="' + _join(plugin_id_name, question_id) + '" data-name="' + question.name + '" class="' + _join(plugin_id_name, "question") + '"></div>';
        var question_element = document.getElementById(_join(plugin_id_name, question_id));
  
        // add question text
        question_element.innerHTML += '<p id="survey-question" class="' + _join(plugin_id_name, "prompt") + '">' + question.prompt + '</p>';
  
        // add input
        switch (type) {
          case "multi-select":
            // create option check boxes
            for (var j = 0; j < question.options.length; j++) {
  
              var input_name = _join(plugin_id_name, 'response', question_id);
  
              // add check box container
              var checkbox_container = document.createElement("div");
              checkbox_container.setAttribute("class", _join(plugin_id_name, 'option'));
              checkbox_container.setAttribute("class", _join(plugin_id_name, 'option'));
  
              // create checkboxes
              var input = document.createElement('input');
              input.setAttribute('type', "checkbox");
              input.setAttribute('name', input_name);
              input.setAttribute('value', question.options[j])
  
              // add label and question text
              var label = document.createElement('label');
              label.setAttribute('class', _join(plugin_id_name, "text"));
              label.appendChild(input);
              label.innerHTML += question.options[j];
  
              // merge everything
              checkbox_container.appendChild(label)
              question_element.appendChild(checkbox_container)
            }
            break;
          case "select":
            // create radio input
            for (var j = 0; j < question.options.length; j++) {
  
              var input_name = _join(plugin_id_name, 'response', question_id);
  
              // add check box container
              var checkbox_container = document.createElement("div");
              checkbox_container.setAttribute("class", _join(plugin_id_name, 'option'));
              checkbox_container.setAttribute("class", _join(plugin_id_name, 'option'));
  
              // create checkboxes
              var input = document.createElement('input');
              input.setAttribute('type', "radio");
              input.setAttribute('name', input_name);
              input.setAttribute('value', question.options[j])
              input.setAttribute("required", question.required);
  
              // add label and question text
              var label = document.createElement('label');
              label.classList = _join(plugin_id_name, "text");
              label.appendChild(input);
              label.innerHTML += question.options[j];
  
              // merge everything
              checkbox_container.appendChild(label)
              question_element.appendChild(checkbox_container)
            }
            break;
          case "dropdown":
            // create option check boxes
            var select = document.createElement('select');
            select.required = question.required;
  
            question_element.appendChild(select)
  
            var default_option = document.createElement('option');
            default_option.innerText = question.placeholder;
            default_option.selected = true;
            default_option.value = "";
            select.appendChild(default_option)
  
            for (var j = 0; j < question.options.length; j++) {
              var option_id_name = _join(plugin_id_name, "option", question_id, j);
  
              var input_name = _join(plugin_id_name, 'response', question_id);
              var input_id = _join(plugin_id_name, 'response', question_id, j);
              var option = document.createElement('option');
              //label.setAttribute('class', plugin_id_name+'-text');
              option.innerText = question.options[j];
  
              select.appendChild(option)
  
  
            }
            break;
            case "text":
              var input = document.createElement('input');
              input.required = question.required;
              input.placeholder = question.placeholder;
              input.pattern = question.pattern;
              question_element.appendChild(input)
              break;
            case "multiline":
                var input = document.createElement('textarea');
                input.required = question.required;
                input.placeholder = question.placeholder;
                input.pattern = question.pattern;
                question_element.appendChild(input)
                break;
          default:
          // code block
        }
  
      }
      // add submit button
      trial_form.innerHTML += '<div class="fail-message"></div>'
      trial_form.innerHTML += '<button id="' + plugin_id_name + '-next" class="' + plugin_id_name + ' jspsych-btn">' + trial.button_label + '</button>';
  
      // validation check on the data first for custom validation handling
      // then submit the form
  
      trial_form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!trial_form.reportValidity()) return;
        // measure response time
        var endTime = performance.now();
        var response_time = endTime - startTime;
  
        // create object to hold responses
        var question_data = {};
        var has_response = [];
        for (var index = 0; index < trial.questions.length; index++) {
          var match = display_element.querySelector('#jspsych-advanced-survey-' + index);
          var val = [];
          var inputboxes = match.querySelectorAll("input[type=checkbox]:checked")
          for (var j = 0; j < inputboxes.length; j++) {
            currentChecked = inputboxes[j];
            val.push(currentChecked.value)
          }
          var id = 'Q' + index
          var obje = {};
          var name = id;
          if (match.attributes['data-name'].value !== '') {
            name = match.attributes['data-name'].value;
          }
          obje[name] = val;
          Object.assign(question_data, obje);
          if (val.length == 0) { has_response.push(false); } else { has_response.push(true); }
        }
  
        // save data
        var trial_data = {
          "rt": response_time,
          "responses": JSON.stringify(question_data),
          "question_order": JSON.stringify(question_order)
        };
        display_element.innerHTML = '';
  
        // next trial
        jsPsych.finishTrial(trial_data);
  
      });
  
      var startTime = performance.now();
    };
  
    return plugin;
  })();
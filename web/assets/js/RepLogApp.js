'use strict';

(function (window, $, Routing, swal) {
    // Holds all global variables
    window.RepLogApp = function ($wrapper) {
            this.$wrapper = $wrapper;
            this.helper =  new Helper($wrapper);

            this.loadRepLogs();


        this.$wrapper.on(
            'click',
            '.js-delete-rep-log',
            this.handleRepLogDelete.bind(this)
        );
        this.$wrapper.on(
            'click',
            'tbody tr',
            this.handleRowClick.bind(this)
        );
        this.$wrapper.on(
            'submit',
            this._selectors.newRepForm,
            this.handleNewFormSubmit.bind(this)
        )
    };

    $.extend(window.RepLogApp.prototype, {
        _selectors:{
            newRepForm: '.js-new-rep-log-form'
        },

        loadRepLogs(){
            $.ajax({
                url: Routing.generate('rep_log_list'),
                // anonymous function shorter syntax
            }).then((data) => {
                $.each(data.items, (key, repLog) => {
                    // this is now always instance of object -> RepLogApp,
                    // works only in new anonymous function syntax
                    this._addRow(repLog);
                });
            })
        },

        updateTotalWeightLifted() {

            this.$wrapper.find('.js-total-weight').html(
                this.helper.getTotalWeightString()
            );
        },

        handleRepLogDelete(e) {
            e.preventDefault();

            const $link = $(e.currentTarget);

            swal({
                title: 'Delete this log?',
                text: 'What? Did you not actually lift this?',
                showCancelButton: true,
                showLoaderOnConfirm: true,
                // Only one line
                preConfirm: () => this._deleteRepLog($link)
            }).catch((arg) => {
                // cancelling
            });


        },

        _deleteRepLog($link){
            $link.addClass('text-danger');
            $link.find('.fa')
                .removeClass('fa-trash')
                .addClass('fa-spinner')
                .addClass('fa-spin');
            // console.log(e.currentTarget === this); resolves to true!
            // e.target.className = e.target.className + ' text-danger';

            const deleteUrl = $link.data('url');
            const $row = $link.closest('tr');


            return $.ajax({
                url: deleteUrl,
                method: 'DELETE',
            }).then(() => {
                $row.fadeOut('normal', () => {
                    // $row.remove();
                    $row.remove();
                    this.updateTotalWeightLifted();
                });
            });
        },


        handleRowClick() {
            console.log("row clicked!")
        },

        handleNewFormSubmit(e){
            e.preventDefault();

            const $form = $(e.currentTarget);
            const formData = {};
            $.each($form.serializeArray(), (key, fieldData) => {
                formData[fieldData.name] = fieldData.value;
            });


            this._saveRepLog(formData)
            .then((data) => {
                this._clearForm();
                this._addRow(data);

            }).catch((jqXHR) => {
                const errorData = JSON.parse(jqXHR.responseText);
                this._mapErrorsToForm(errorData.errors);
            });


        },

        // Longer Promise version
        _saveRepLog(data){
            return new Promise( (resolve, reject) => {
                const url = Routing.generate('rep_log_new');

                $.ajax({
                    url,
                    method: 'POST',
                    data: JSON.stringify(data),
                    // Used as a standard for promise (successful)
                }).then( (data, textStatus, jqXHR) => {
                    $.ajax({
                        url: jqXHR.getResponseHeader("Location")
                    }).then((data) => {
                        resolve(data);
                    });

                }).catch((errorData) => {
                    reject(errorData);
                });
            });
        },
        // _saveRepLog: function (data){
        //     return $.ajax({
        //             url: Routing.generate('rep_log_new'),
        //             method: 'POST',
        //             data: JSON.stringify(data),
        //             // Used as a standard for promise (successful)
        //         }).then( (data, textStatus, jqXHR) => {
        //             return $.ajax({
        //                 url: jqXHR.getResponseHeader("Location")
        //             });
        //         });
        //
        // },

        _mapErrorsToForm(errorData){

            const $form = this.$wrapper.find(this._selectors.newRepForm);
            this._removeFormErrors();

            $form.find(':input').each( (index, element) => {
                const fieldName = $(element).attr('name');
                const $wrapper = $(element).closest('.form-group');

                if (!errorData[fieldName]){
                    //no error
                    return;
                }

                const $error = $('<span class="js-field-error help-block"></span>')
                $error.html(errorData[fieldName]);
                $wrapper.append($error);
                $wrapper.addClass('has-error');

            });
        },

        _removeFormErrors(){
            // reset things
            const $form = this.$wrapper.find(this._selectors.newRepForm);
            $form.find('.js-field-error').remove();
            $form.find('.form-group').removeClass('has-error');
        },

        _clearForm(){
            this._removeFormErrors();
            const $form = this.$wrapper.find(this._selectors.newRepForm);
            // Get DOM element
            $form[0].reset();
        },

        _addRow(repLog){

            const tplText = $('#js-rep-log-row-template').html();
            const tpl = _.template(tplText);

            const html = tpl(repLog);
            this.$wrapper.find('tbody')
                .append($.parseHTML(html));
            this.updateTotalWeightLifted();
        }
    });




    /**
     * A "private" object
     * @type {{}}
     */
       const Helper = function ($wrapper) {
            this.$wrapper = $wrapper;
        };


       $.extend(Helper.prototype, {
           calculateTotalWeight() {
               let totalWeight = 0;
               this.$wrapper.find('tbody tr').each( (index, element) =>  {
                   totalWeight += $(element).data('weight');
               });
               return totalWeight;
           },

           getTotalWeightString(maxWeight = 500){
               let weight = this.calculateTotalWeight();

               if (weight > maxWeight){
                   weight = maxWeight + '+';
               }
               return weight + ' lbs';
           }
       });
        // if function starts with _  -> Should be treated as a private function (keep in mind: everything in JS in public!)
        // prototype, makes function callable on instance of object

})(window, jQuery, Routing, swal);
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

        loadRepLogs: function (){

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

        updateTotalWeightLifted: function () {

            this.$wrapper.find('.js-total-weight').html(
                this.helper.calculateTotalWeight()
            );
        },

        handleRepLogDelete: function (e) {
            e.preventDefault();

            var $link = $(e.currentTarget);

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

        _deleteRepLog: function ($link){
            $link.addClass('text-danger');
            $link.find('.fa')
                .removeClass('fa-trash')
                .addClass('fa-spinner')
                .addClass('fa-spin');
            // console.log(e.currentTarget === this); resolves to true!
            // e.target.className = e.target.className + ' text-danger';

            var deleteUrl = $link.data('url');
            var $row = $link.closest('tr');


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


        handleRowClick: function () {
            console.log("row clicked!")
        },

        handleNewFormSubmit: function (e){
            e.preventDefault();

            var $form = $(e.currentTarget);
            var formData = {};
            $.each($form.serializeArray(), (key, fieldData) => {
                formData[fieldData.name] = fieldData.value;
            });


            this._saveRepLog(formData)
            .then((data) => {
                this._clearForm();
                this._addRow(data);

            }).catch((jqXHR) => {
                var errorData = JSON.parse(jqXHR.responseText);
                this._mapErrorsToForm(errorData.errors);
            });


        },

        // Longer Promise version
        // _saveRepLog: function (data){
        //     return new Promise(function (resolve, reject){
        //         $.ajax({
        //             url: Routing.generate('rep_log_new'),
        //             method: 'POST',
        //             data: JSON.stringify(data),
        //             // Used as a standard for promise (successful)
        //         }).then(function (data, textStatus, jqXHR){
        //             $.ajax({
        //                 url: jqXHR.getResponseHeader("Location")
        //             }).then(function (data){
        //                 console.log('now we are really done');
        //                 console.log(data);
        //                 // we're done
        //                 resolve(data);
        //             });
        //
        //         }).catch(function (errorData){
        //             reject(errorData);
        //         });
        //     });
        // },
        _saveRepLog: function (data){
            return $.ajax({
                    url: Routing.generate('rep_log_new'),
                    method: 'POST',
                    data: JSON.stringify(data),
                    // Used as a standard for promise (successful)
                }).then( (data, textStatus, jqXHR) => {
                    return $.ajax({
                        url: jqXHR.getResponseHeader("Location")
                    });
                });

        },

        _mapErrorsToForm: function (errorData){

            var $form = this.$wrapper.find(this._selectors.newRepForm);
            this._removeFormErrors();

            $form.find(':input').each( (index, element) => {
                var fieldName = $(element).attr('name');
                var $wrapper = $(element).closest('.form-group');

                if (!errorData[fieldName]){
                    //no error
                    return;
                }

                var $error = $('<span class="js-field-error help-block"></span>')
                $error.html(errorData[fieldName]);
                $wrapper.append($error);
                $wrapper.addClass('has-error');

            });
        },

        _removeFormErrors: function (){
            // reset things
            var $form = this.$wrapper.find(this._selectors.newRepForm);
            $form.find('.js-field-error').remove();
            $form.find('.form-group').removeClass('has-error');
        },

        _clearForm: function (){
            this._removeFormErrors();
            var $form = this.$wrapper.find(this._selectors.newRepForm);
            // Get DOM element
            $form[0].reset();
        },

        _addRow: function (repLog){

            var tplText = $('#js-rep-log-row-template').html();
            var tpl = _.template(tplText);

            var html = tpl(repLog);
            this.$wrapper.find('tbody')
                .append($.parseHTML(html));
            this.updateTotalWeightLifted();
        }
    });




    /**
     * A "private" object
     * @type {{}}
     */
       var Helper = function ($wrapper) {
            this.$wrapper = $wrapper;
        };


       $.extend(Helper.prototype, {
           calculateTotalWeight: function () {
               var totalWeight = 0;
               this.$wrapper.find('tbody tr').each( (index, element) =>  {
                   totalWeight += $(element).data('weight');
               });
               return totalWeight;
           }
       });
        // if function starts with _  -> Should be treated as a private function (keep in mind: everything in JS in public!)
        // prototype, makes function callable on instance of object

})(window, jQuery, Routing, swal);
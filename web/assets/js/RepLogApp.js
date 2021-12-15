'use strict';

(function (window, $) {
    // Holds all global variables
    window.RepLogApp = function ($wrapper) {
            this.$wrapper = $wrapper;
            this.helper =  new Helper($wrapper);


        this.$wrapper.find('.js-delete-rep-log').on(
            'click',
            // Pass reference of function to on() function
            this.handleRepLogDelete.bind(this),
        );
        this.$wrapper.find('tbody tr ').on(
            'click',
            this.handleRowClick.bind(this)
        );
    };

    $.extend(window.RepLogApp.prototype, {
        updateTotalWeightLifted: function () {

            this.$wrapper.find('.js-total-weight').html(
                this.helper.calculateTotalWeight()
            );
        },

        handleRepLogDelete: function (e) {
            e.preventDefault();

            var $link = $(e.currentTarget);

            $link.addClass('text-danger');
            $link.find('.fa')
                .removeClass('fa-trash')
                .addClass('fa-spinner')
                .addClass('fa-spin');
            // console.log(e.currentTarget === this); resolves to true!
            // e.target.className = e.target.className + ' text-danger';

            var deleteUrl = $link.data('url');
            var $row = $link.closest('tr');

            var self = this;

            $.ajax({
                url: deleteUrl,
                method: 'DELETE',
                success: function () {
                    $row.fadeOut('normal', function () {
                        // $row.remove();
                        $(this).remove();
                        self.updateTotalWeightLifted();
                    });
                }
            });

        },


        handleRowClick: function () {
            console.log("row clicked!")
        },
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
               this.$wrapper.find('tbody tr').each(function () {
                   totalWeight += $(this).data('weight');
               });
               return totalWeight;
           }
       });
        // if function starts with _  -> Should be treated as a private function (keep in mind: everything in JS in public!)
        // prototype, makes function callable on instance of object

})(window, jQuery);
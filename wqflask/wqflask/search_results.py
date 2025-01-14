from __future__ import absolute_import, print_function, division

from wqflask import app

from flask import render_template

import os
import cPickle
import re
import uuid
from math import *
import time
#import pyXLWriter as xl
#import pp - Note from Sam: is this used?
import math
import datetime
import collections

from pprint import pformat as pf

import json

from flask import Flask, g
from MySQLdb import escape_string as escape

# Instead of importing HT we're going to build a class below until we can eliminate it
from htmlgen import HTMLgen2 as HT

from base import webqtlConfig
from utility.benchmark import Bench
from base.data_set import create_dataset
from base.trait import GeneralTrait
from wqflask import parser
from wqflask import do_search
from utility import webqtlUtil
from dbFunction import webqtlDatabaseFunction

from utility import formatting

#class QuickSearchResult(object):
    #def __init__(self, key, result_fields):
    #    self.key = key
    #    self.result_fields = result_fields

class SearchResultPage(object):
    #maxReturn = 3000


    def __init__(self, kw):

        ###########################################
        #   Names and IDs of group / F2 set
        ###########################################

        # All Phenotypes is a special case we'll deal with later
        #if kw['dataset'] == "All Phenotypes":
        #    self.cursor.execute("""
        #        select PublishFreeze.Name, InbredSet.Name, InbredSet.Id from PublishFreeze,
        #        InbredSet where PublishFreeze.Name not like 'BXD300%' and InbredSet.Id =
        #        PublishFreeze.InbredSetId""")
        #    results = self.cursor.fetchall()
        #    self.dataset = map(lambda x: DataSet(x[0], self.cursor), results)
        #    self.dataset_groups = map(lambda x: x[1], results)
        #    self.dataset_group_ids = map(lambda x: x[2], results)
        #else:

        self.quick = False

        self.uc_id = uuid.uuid4()
        print("uc_id:", self.uc_id)

        if 'q' in kw:
            self.results = {}
            self.quick = True
            self.search_terms = kw['q']
            print("self.search_terms is: ", self.search_terms)
            self.trait_type = kw['trait_type']
            self.quick_search()
        else:
            print("kw is:", kw)
            if kw['search_terms_or']:
                self.and_or = "or"
                self.search_terms = kw['search_terms_or']
            else:
                self.and_or = "and"
                self.search_terms = kw['search_terms_and']
            self.search_term_exists = True
            self.results = []
            if kw['type'] == "Phenotypes":
                dataset_type = "Publish"
            elif kw['type'] == "Genotypes":
                dataset_type = "Geno"
            else:
                dataset_type = "ProbeSet"
            self.dataset = create_dataset(kw['dataset'], dataset_type)
            self.search()
            self.gen_search_result()



    def gen_search_result(self):
        """
        Get the info displayed in the search result table from the set of results computed in
        the "search" function

        """
        self.trait_list = []
        
        species = webqtlDatabaseFunction.retrieve_species(self.dataset.group.name)
        
        # result_set represents the results for each search term; a search of 
        # "shh grin2b" would have two sets of results, one for each term
        print("self.results is:", pf(self.results))
        for result in self.results:
            if not result:
                continue
            
            #### Excel file needs to be generated ####

            print("foo locals are:", locals())
            trait_id = result[0]
            this_trait = GeneralTrait(dataset=self.dataset, name=trait_id, get_qtl_info=True)
            self.trait_list.append(this_trait)

        self.dataset.get_trait_info(self.trait_list, species)

    def quick_search(self):
        #search_terms = ""
        #for term in self.search_terms.split():
        #    search_terms += '+{} '.format(term)
            
        search_terms = ' '.join('+{}'.format(escape(term)) for term in self.search_terms.split())
        print("search_terms are:", search_terms)
        
        query = """ SELECT table_name, the_key, result_fields
                    FROM QuickSearch
                    WHERE MATCH (terms)
                          AGAINST ('{}' IN BOOLEAN MODE) """.format(search_terms)
        
        with Bench("Doing QuickSearch Query: "):
            dbresults = g.db.execute(query, no_parameters=True).fetchall()
        #print("results: ", pf(results))
        
        self.results = collections.defaultdict(list)
        
        type_dict = {'PublishXRef': 'phenotype',
                   'ProbeSetXRef': 'mrna_assay',
                   'GenoXRef': 'genotype'}
        
        self.species_groups = {}
        
        for dbresult in dbresults:
            this_result = {}
            this_result['table_name'] = dbresult.table_name
            if self.trait_type == type_dict[dbresult.table_name] or self.trait_type == 'all':
                this_result['key'] = dbresult.the_key
                this_result['result_fields'] = json.loads(dbresult.result_fields)
                this_species = this_result['result_fields']['species']
                this_group = this_result['result_fields']['group_name']
                if this_species not in self.species_groups:
                    self.species_groups[this_species] = {}
                if type_dict[dbresult.table_name] not in self.species_groups[this_species]:
                    self.species_groups[this_species][type_dict[dbresult.table_name]] = []
                if this_group not in self.species_groups[this_species][type_dict[dbresult.table_name]]:
                    self.species_groups[this_species][type_dict[dbresult.table_name]].append(this_group)
                #if type_dict[dbresult.table_name] not in self.species_groups:
                #    self.species_groups[type_dict[dbresult.table_name]] = {}
                #if this_species not in self.species_groups[type_dict[dbresult.table_name]]:
                #    self.species_groups[type_dict[dbresult.table_name]][this_species] = []
                #if this_group not in self.species_groups[type_dict[dbresult.table_name]][this_species]:
                #    self.species_groups[type_dict[dbresult.table_name]][this_species].append(this_group)
                self.results[type_dict[dbresult.table_name]].append(this_result)
            
        import redis
        Redis = redis.Redis()
        
    #def get_group_species_tree(self):
    #    self.species_groups = collections.default_dict(list)
    #    for key in self.results:
    #        for item in self.results[key]:
    #            self.species_groups[item['result_fields']['species']].append(
    #                                        item['result_fields']['group_name'])


    #def quick_search(self):
    #    self.search_terms = parser.parse(self.search_terms)
    #
    #    search_types = ["quick_mrna_assay", "quick_phenotype"]
    #
    #    for search_category in search_types:
    #        these_results = []
    #        search_ob = do_search.DoSearch.get_search(search_category)
    #        search_class = getattr(do_search, search_ob)
    #        for a_search in self.search_terms:
    #            search_term = a_search['search_term']
    #            the_search = search_class(search_term)
    #            these_results.extend(the_search.run())
    #            print("in the search results are:", self.results)
    #        self.results[search_category] = these_results
    #
    #    #for a_search in self.search_terms:
    #    #    search_term = a_search['search_term']
    #    #
    #    #    #Do mRNA assay search
    #    #    search_ob = do_search.DoSearch.get_search("quick_mrna_assay")
    #    #    search_class = getattr(do_search, search_ob)
    #    #    the_search = search_class(search_term)
    #    #    
    #    #    self.results.extend(the_search.run())
    #    #    print("in the search results are:", self.results)
    #
    #
    #    #return True
    #
    #    #search_gene
    #    #search_geno
    #    #search_pheno
    #    #search_mrn
    #    #search_publish


    def search(self):
        self.search_terms = parser.parse(self.search_terms)
        print("After parsing:", self.search_terms)

        if len(self.search_terms) > 1:
            combined_from_clause = ""
            combined_where_clause = "" 
            previous_from_clauses = [] #The same table can't be referenced twice in the from clause
            for i, a_search in enumerate(self.search_terms):
                the_search = self.get_search_ob(a_search)
                if the_search != None:
                    get_from_clause = getattr(the_search, "get_from_clause", None)
                    if callable(get_from_clause):
                        from_clause = the_search.get_from_clause()
                        if from_clause in previous_from_clauses:
                            pass
                        else:
                            previous_from_clauses.append(from_clause)
                            combined_from_clause += from_clause
                    where_clause = the_search.get_where_clause()
                    combined_where_clause += "(" + where_clause + ")"
                    if (i+1) < len(self.search_terms):
                        if self.and_or == "and":
                            combined_where_clause += "AND"
                        else:
                            combined_where_clause += "OR"
                else:
                    self.search_term_exists = False
            if self.search_term_exists:
                combined_where_clause = "(" + combined_where_clause + ")"
                final_query = the_search.compile_final_query(combined_from_clause, combined_where_clause)
                results = the_search.execute(final_query)
                self.results.extend(results)
        else:
            for a_search in self.search_terms:
                the_search = self.get_search_ob(a_search)
                if the_search != None:
                    self.results.extend(the_search.run())
                else:
                    self.search_term_exists = False

        if the_search != None:
            self.header_fields = the_search.header_fields

    def get_search_ob(self, a_search):
        print("[kodak] item is:", pf(a_search))
        search_term = a_search['search_term']
        search_operator = a_search['separator']
        search_type = {}
        search_type['dataset_type'] = self.dataset.type
        if a_search['key']:
            search_type['key'] = a_search['key'].upper()       
        print("search_type is:", pf(search_type))

        search_ob = do_search.DoSearch.get_search(search_type)
        if search_ob:
            search_class = getattr(do_search, search_ob)
            print("search_class is: ", pf(search_class))
            the_search = search_class(search_term,
                                    search_operator,
                                    self.dataset,
                                    )
            return the_search
        else:
            return None
